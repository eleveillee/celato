import type {
  LLMCompleteParams,
  LLMProvider,
  LLMProviderOptions,
  LLMResponse,
} from "@celato/shared/interfaces";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { pino } from "pino";

const logger = pino({ name: "llm-service" });

const FALLBACK_RESPONSE = "One moment please, let me think about that.";

// OpenAI model options:
//   "gpt-4o-mini"    — best cost/quality balance (default)
//   "gpt-4o"         — higher quality, 10x cost
//   "gpt-4.1-nano"   — cheapest, good for simple tasks
//   "gpt-4.1-mini"   — balanced alternative
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

// Anthropic model options:
//   "claude-haiku-4-5-20251001"  — fast + cheap (default)
//   "claude-sonnet-4-6"         — higher quality, ~5x cost
//   "claude-opus-4-6"           — highest quality, ~20x cost
const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

export class OpenAIProvider implements LLMProvider {
  readonly name: string;
  readonly model: string;
  readonly costPerInputToken = 0.15 / 1_000_000;
  readonly costPerOutputToken = 0.6 / 1_000_000;

  private client: OpenAI;

  constructor(apiKey: string, options?: LLMProviderOptions) {
    this.client = new OpenAI({ apiKey });
    this.model = options?.model ?? DEFAULT_OPENAI_MODEL;
    this.name = `openai-${this.model}`;
  }

  async complete(params: LLMCompleteParams): Promise<LLMResponse> {
    const startTime = Date.now();
    const shouldStream = params.stream && params.onChunk;

    try {
      if (shouldStream) {
        return await this.completeStreaming(params, startTime);
      }

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: params.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: params.maxTokens ?? 300,
      });

      const content = response.choices[0]?.message?.content ?? FALLBACK_RESPONSE;
      const usage = response.usage;

      return {
        content,
        usage: {
          inputTokens: usage?.prompt_tokens ?? 0,
          outputTokens: usage?.completion_tokens ?? 0,
        },
        model: this.model,
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      logger.error({ error }, "LLM request failed, using fallback response");
      return {
        content: FALLBACK_RESPONSE,
        usage: { inputTokens: 0, outputTokens: 0 },
        model: this.model,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  async validateKey(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  private async completeStreaming(params: LLMCompleteParams, startTime: number): Promise<LLMResponse> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: params.maxTokens ?? 300,
      stream: true,
      stream_options: { include_usage: true },
    });

    let fullContent = "";
    let inputTokens = 0;
    let outputTokens = 0;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullContent += delta;
        params.onChunk?.(delta);
      }
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens ?? 0;
        outputTokens = chunk.usage.completion_tokens ?? 0;
      }
    }

    return {
      content: fullContent || FALLBACK_RESPONSE,
      usage: { inputTokens, outputTokens },
      model: this.model,
      latencyMs: Date.now() - startTime,
    };
  }
}

export class AnthropicProvider implements LLMProvider {
  readonly name: string;
  readonly model: string;
  readonly costPerInputToken = 1.0 / 1_000_000;
  readonly costPerOutputToken = 5.0 / 1_000_000;

  private client: Anthropic;

  constructor(apiKey: string, options?: LLMProviderOptions) {
    this.client = new Anthropic({ apiKey });
    this.model = options?.model ?? DEFAULT_ANTHROPIC_MODEL;
    this.name = `anthropic-${this.model}`;
  }

  async complete(params: LLMCompleteParams): Promise<LLMResponse> {
    const startTime = Date.now();
    const shouldStream = params.stream && params.onChunk;

    try {
      const { systemPrompt, conversationMessages } = this.prepareMessages(params);

      if (shouldStream) {
        return await this.completeStreaming(
          systemPrompt,
          conversationMessages,
          params.maxTokens ?? 300,
          params.onChunk!,
          startTime,
        );
      }

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: params.maxTokens ?? 300,
        system: this.buildCachedSystemPrompt(systemPrompt),
        messages: conversationMessages,
      });

      const textBlock = response.content.find((block) => block.type === "text");
      const content = textBlock?.text ?? FALLBACK_RESPONSE;

      return {
        content,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        model: this.model,
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      logger.error({ error }, "Anthropic LLM request failed, using fallback response");
      return {
        content: FALLBACK_RESPONSE,
        usage: { inputTokens: 0, outputTokens: 0 },
        model: this.model,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  async validateKey(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  /** QoL 2: Build system prompt with cache_control for Anthropic prompt caching (90% discount on cached input). */
  private buildCachedSystemPrompt(systemText: string): Anthropic.Messages.TextBlockParam[] {
    return [
      {
        type: "text" as const,
        text: systemText,
        cache_control: { type: "ephemeral" as const },
      },
    ];
  }

  private prepareMessages(params: LLMCompleteParams): {
    systemPrompt: string;
    conversationMessages: Array<{ role: "user" | "assistant"; content: string }>;
  } {
    // Separate system messages from conversation messages.
    // Anthropic requires system prompt as a top-level param, not in messages array.
    const systemMessages: string[] = [];
    const conversationMessages: Array<{ role: "user" | "assistant"; content: string }> = [];

    for (const m of params.messages) {
      if (m.role === "system") {
        systemMessages.push(m.content);
      } else {
        conversationMessages.push({ role: m.role, content: m.content });
      }
    }

    if (params.systemPrompt) {
      systemMessages.unshift(params.systemPrompt);
    }

    // Anthropic requires messages to start with a "user" turn.
    // If first message is "assistant", prepend a synthetic user message.
    if (conversationMessages.length === 0 || conversationMessages[0]?.role !== "user") {
      conversationMessages.unshift({ role: "user", content: "Begin." });
    }

    return {
      systemPrompt: systemMessages.join("\n\n"),
      conversationMessages,
    };
  }

  private async completeStreaming(
    systemPrompt: string,
    conversationMessages: Array<{ role: "user" | "assistant"; content: string }>,
    maxTokens: number,
    onChunk: (textDelta: string) => void,
    startTime: number,
  ): Promise<LLMResponse> {
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: maxTokens,
      system: this.buildCachedSystemPrompt(systemPrompt),
      messages: conversationMessages,
    });

    let fullContent = "";

    stream.on("text", (text) => {
      fullContent += text;
      onChunk(text);
    });

    const finalMessage = await stream.finalMessage();

    return {
      content: fullContent || FALLBACK_RESPONSE,
      usage: {
        inputTokens: finalMessage.usage.input_tokens,
        outputTokens: finalMessage.usage.output_tokens,
      },
      model: this.model,
      latencyMs: Date.now() - startTime,
    };
  }
}

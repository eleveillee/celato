import type { ChatMessage, LLMProvider, LLMResponse } from "@celato/shared/interfaces";
import OpenAI from "openai";
import { pino } from "pino";

const logger = pino({ name: "llm-service" });

const FALLBACK_RESPONSE = "One moment please, let me think about that.";

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai-gpt4o-mini";
  readonly costPerInputToken = 0.15 / 1_000_000;
  readonly costPerOutputToken = 0.6 / 1_000_000;

  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(params: {
    messages: ChatMessage[];
    systemPrompt: string;
    maxTokens?: number;
  }): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
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
        model: "gpt-4o-mini",
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      logger.error({ error }, "LLM request failed, using fallback response");
      return {
        content: FALLBACK_RESPONSE,
        usage: { inputTokens: 0, outputTokens: 0 },
        model: "gpt-4o-mini",
        latencyMs: Date.now() - startTime,
      };
    }
  }
}

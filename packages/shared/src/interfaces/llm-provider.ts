/**
 * Abstract LLM provider layer (D-013-LLM).
 * Enables model switching, cost optimization, and provider failover.
 * VS-1: OpenAI GPT-4o-mini + Anthropic Claude Haiku 4.5.
 * VS-3: Multi-model selection.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  model: string;
  latencyMs: number;
}

export interface LLMCompleteParams {
  messages: ChatMessage[];
  /** Optional standalone system prompt. When messages already include a system message, this can be omitted. */
  systemPrompt?: string;
  stream?: boolean;
  maxTokens?: number;
  /** Called with each text delta during streaming. Requires `stream: true`. */
  onChunk?: (textDelta: string) => void;
}

export interface LLMProviderOptions {
  /** Override the default model for this provider. */
  model?: string;
}

export interface LLMProvider {
  readonly name: string;
  readonly model: string;
  readonly costPerInputToken: number;
  readonly costPerOutputToken: number;

  complete(params: LLMCompleteParams): Promise<LLMResponse>;

  /** Lightweight API key validation. Returns true if the key works. */
  validateKey(): Promise<boolean>;
}

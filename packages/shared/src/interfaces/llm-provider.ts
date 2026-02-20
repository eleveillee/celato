/**
 * Abstract LLM provider layer (D-013-LLM).
 * Enables model switching, cost optimization, and provider failover.
 * VS-1: OpenAI GPT-4o-mini implementation.
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
}

export interface LLMProvider {
  readonly name: string;
  readonly costPerInputToken: number;
  readonly costPerOutputToken: number;

  complete(params: LLMCompleteParams): Promise<LLMResponse>;
}

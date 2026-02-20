import type { CostBreakdown } from "@celato/shared";

const RETELL_COST_PER_MINUTE = 0.08;
const LLM_INPUT_COST_PER_TOKEN = 0.15 / 1_000_000;
const LLM_OUTPUT_COST_PER_TOKEN = 0.6 / 1_000_000;

export class CostTracker {
  private retellSeconds = 0;
  private llmInputTokens = 0;
  private llmOutputTokens = 0;
  private startTime: number | null = null;

  startCall(): void {
    this.startTime = Date.now();
  }

  addLLMUsage(inputTokens: number, outputTokens: number): void {
    this.llmInputTokens += inputTokens;
    this.llmOutputTokens += outputTokens;
  }

  getBreakdown(): CostBreakdown {
    if (this.startTime) {
      this.retellSeconds = (Date.now() - this.startTime) / 1000;
    }

    const retellCost = (this.retellSeconds / 60) * RETELL_COST_PER_MINUTE;
    const llmCost =
      this.llmInputTokens * LLM_INPUT_COST_PER_TOKEN +
      this.llmOutputTokens * LLM_OUTPUT_COST_PER_TOKEN;

    return {
      retell: retellCost,
      llm: llmCost,
      total: retellCost + llmCost,
    };
  }

  endCall(): CostBreakdown {
    if (this.startTime) {
      this.retellSeconds = (Date.now() - this.startTime) / 1000;
      this.startTime = null;
    }
    return this.getBreakdown();
  }
}

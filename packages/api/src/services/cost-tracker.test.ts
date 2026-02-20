import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CostTracker } from "./cost-tracker.js";

describe("CostTracker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return zero costs before any usage", () => {
    const tracker = new CostTracker();
    const breakdown = tracker.getBreakdown();

    expect(breakdown.retell).toBe(0);
    expect(breakdown.llm).toBe(0);
    expect(breakdown.total).toBe(0);
  });

  it("should track Retell cost based on elapsed time", () => {
    const tracker = new CostTracker();
    tracker.startCall();

    // Advance 60 seconds (1 minute at $0.08/min = $0.08)
    vi.advanceTimersByTime(60_000);

    const breakdown = tracker.getBreakdown();
    expect(breakdown.retell).toBeCloseTo(0.08, 3);
  });

  it("should track LLM token usage", () => {
    const tracker = new CostTracker();

    // 1000 input tokens @ $0.15/1M = $0.00015
    // 500 output tokens @ $0.60/1M = $0.0003
    tracker.addLLMUsage(1000, 500);

    const breakdown = tracker.getBreakdown();
    expect(breakdown.llm).toBeCloseTo(0.00045, 5);
  });

  it("should accumulate LLM usage across multiple calls", () => {
    const tracker = new CostTracker();

    tracker.addLLMUsage(1000, 200);
    tracker.addLLMUsage(500, 300);

    const breakdown = tracker.getBreakdown();
    // 1500 input @ $0.15/1M = $0.000225
    // 500 output @ $0.60/1M = $0.0003
    expect(breakdown.llm).toBeCloseTo(0.000525, 5);
  });

  it("should combine retell + LLM costs in total", () => {
    const tracker = new CostTracker();
    tracker.startCall();

    vi.advanceTimersByTime(60_000); // 1 min
    tracker.addLLMUsage(10000, 5000); // non-trivial usage

    const breakdown = tracker.getBreakdown();
    expect(breakdown.total).toBeCloseTo(breakdown.retell + breakdown.llm, 10);
  });

  it("should freeze retell cost on endCall", () => {
    const tracker = new CostTracker();
    tracker.startCall();

    vi.advanceTimersByTime(30_000); // 30 seconds
    const finalBreakdown = tracker.endCall();

    // Advance more time — cost should not increase
    vi.advanceTimersByTime(60_000);
    const afterEnd = tracker.getBreakdown();

    expect(afterEnd.retell).toBe(finalBreakdown.retell);
  });
});

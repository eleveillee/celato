import type { ChatMessage } from "@celato/shared/interfaces";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Shared mock references — hoisted by vi.mock
const anthropicMockCreate = vi.fn();
const openaiMockCreate = vi.fn();
const openaiMockModelsList = vi.fn();
const anthropicMockModelsList = vi.fn();

vi.mock("openai", () => ({
  default: class MockOpenAI {
    chat = { completions: { create: openaiMockCreate } };
    models = { list: openaiMockModelsList };
  },
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { create: anthropicMockCreate };
    models = { list: anthropicMockModelsList };
  },
}));

// Import after mocks are set up
const { AnthropicProvider, OpenAIProvider } = await import("./llm-service.js");

/** Extract the system text from Anthropic's cached system prompt format. */
function extractSystemText(system: Array<{ type: string; text: string }>): string {
  return system.map((s) => s.text).join("\n\n");
}

const sampleMessages: ChatMessage[] = [
  { role: "system", content: "You are a helpful agent." },
  { role: "user", content: "Hello, is the store open?" },
  { role: "assistant", content: "Let me check for you." },
];

describe("OpenAIProvider", () => {
  let provider: InstanceType<typeof OpenAIProvider>;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new OpenAIProvider("test-openai-key");
  });

  it("should have correct name and cost properties", () => {
    expect(provider.name).toBe("openai-gpt-4o-mini");
    expect(provider.model).toBe("gpt-4o-mini");
    expect(provider.costPerInputToken).toBeCloseTo(0.15 / 1_000_000);
    expect(provider.costPerOutputToken).toBeCloseTo(0.6 / 1_000_000);
  });

  it("should accept model override", () => {
    const custom = new OpenAIProvider("key", { model: "gpt-4o" });
    expect(custom.model).toBe("gpt-4o");
    expect(custom.name).toBe("openai-gpt-4o");
  });

  it("should implement LLMProvider interface", () => {
    expect(typeof provider.complete).toBe("function");
    expect(typeof provider.validateKey).toBe("function");
    expect(typeof provider.name).toBe("string");
    expect(typeof provider.model).toBe("string");
  });

  it("should return fallback response on error", async () => {
    openaiMockCreate.mockRejectedValueOnce(new Error("API error"));

    const result = await provider.complete({ messages: sampleMessages });

    expect(result.content).toBe("One moment please, let me think about that.");
    expect(result.usage.inputTokens).toBe(0);
    expect(result.model).toBe("gpt-4o-mini");
  });

  it("should pass messages and default maxTokens", async () => {
    openaiMockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "We open at 9." } }],
      usage: { prompt_tokens: 80, completion_tokens: 10 },
    });

    const result = await provider.complete({ messages: sampleMessages });

    expect(result.content).toBe("We open at 9.");
    expect(result.usage.inputTokens).toBe(80);
    expect(result.usage.outputTokens).toBe(10);

    const callArgs = openaiMockCreate.mock.calls[0]![0];
    expect(callArgs.model).toBe("gpt-4o-mini");
    expect(callArgs.max_tokens).toBe(300);
  });

  it("should validate key successfully", async () => {
    openaiMockModelsList.mockResolvedValueOnce({ data: [] });
    expect(await provider.validateKey()).toBe(true);
  });

  it("should return false for invalid key", async () => {
    openaiMockModelsList.mockRejectedValueOnce(new Error("Unauthorized"));
    expect(await provider.validateKey()).toBe(false);
  });
});

describe("AnthropicProvider", () => {
  let provider: InstanceType<typeof AnthropicProvider>;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new AnthropicProvider("test-anthropic-key");
  });

  it("should have correct name and cost properties", () => {
    expect(provider.name).toBe("anthropic-claude-haiku-4-5-20251001");
    expect(provider.model).toBe("claude-haiku-4-5-20251001");
    expect(provider.costPerInputToken).toBeCloseTo(1.0 / 1_000_000);
    expect(provider.costPerOutputToken).toBeCloseTo(5.0 / 1_000_000);
  });

  it("should accept model override", () => {
    const custom = new AnthropicProvider("key", { model: "claude-sonnet-4-6" });
    expect(custom.model).toBe("claude-sonnet-4-6");
    expect(custom.name).toBe("anthropic-claude-sonnet-4-6");
  });

  it("should implement LLMProvider interface", () => {
    expect(typeof provider.complete).toBe("function");
    expect(typeof provider.validateKey).toBe("function");
    expect(typeof provider.name).toBe("string");
    expect(typeof provider.model).toBe("string");
  });

  it("should separate system messages from conversation messages", async () => {
    anthropicMockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "The store opens at 9 AM." }],
      usage: { input_tokens: 50, output_tokens: 15 },
    });

    await provider.complete({ messages: sampleMessages });

    expect(anthropicMockCreate).toHaveBeenCalledOnce();
    const callArgs = anthropicMockCreate.mock.calls[0]![0];

    // System prompt extracted to top-level param (cached format)
    const systemText = extractSystemText(callArgs.system);
    expect(systemText).toContain("You are a helpful agent.");

    // System prompt should have cache_control for prompt caching
    expect(callArgs.system[0].cache_control).toEqual({ type: "ephemeral" });

    // Conversation messages should not include system role
    const roles = callArgs.messages.map((m: { role: string }) => m.role);
    expect(roles).not.toContain("system");
  });

  it("should prepend synthetic user message when first message is assistant", async () => {
    anthropicMockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Sure." }],
      usage: { input_tokens: 30, output_tokens: 5 },
    });

    const messages: ChatMessage[] = [
      { role: "assistant", content: "I previously said something." },
      { role: "user", content: "Now respond." },
    ];

    await provider.complete({ messages });

    const callArgs = anthropicMockCreate.mock.calls[0]![0];
    expect(callArgs.messages[0].role).toBe("user");
    expect(callArgs.messages[0].content).toBe("Begin.");
  });

  it("should return parsed LLM response with usage", async () => {
    anthropicMockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "The store opens at 9 AM." }],
      usage: { input_tokens: 50, output_tokens: 15 },
    });

    const result = await provider.complete({ messages: sampleMessages });

    expect(result.content).toBe("The store opens at 9 AM.");
    expect(result.usage.inputTokens).toBe(50);
    expect(result.usage.outputTokens).toBe(15);
    expect(result.model).toBe("claude-haiku-4-5-20251001");
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("should return fallback response on error", async () => {
    anthropicMockCreate.mockRejectedValueOnce(new Error("API rate limited"));

    const result = await provider.complete({ messages: sampleMessages });

    expect(result.content).toBe("One moment please, let me think about that.");
    expect(result.usage.inputTokens).toBe(0);
    expect(result.usage.outputTokens).toBe(0);
    expect(result.model).toBe("claude-haiku-4-5-20251001");
  });

  it("should use correct model identifier", async () => {
    anthropicMockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Response" }],
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    await provider.complete({ messages: sampleMessages });

    const callArgs = anthropicMockCreate.mock.calls[0]![0];
    expect(callArgs.model).toBe("claude-haiku-4-5-20251001");
  });

  it("should respect maxTokens parameter", async () => {
    anthropicMockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Short." }],
      usage: { input_tokens: 10, output_tokens: 2 },
    });

    await provider.complete({ messages: sampleMessages, maxTokens: 100 });

    const callArgs = anthropicMockCreate.mock.calls[0]![0];
    expect(callArgs.max_tokens).toBe(100);
  });

  it("should default maxTokens to 300", async () => {
    anthropicMockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Default." }],
      usage: { input_tokens: 10, output_tokens: 2 },
    });

    await provider.complete({ messages: sampleMessages });

    const callArgs = anthropicMockCreate.mock.calls[0]![0];
    expect(callArgs.max_tokens).toBe(300);
  });

  it("should combine systemPrompt param with system messages", async () => {
    anthropicMockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Combined." }],
      usage: { input_tokens: 20, output_tokens: 3 },
    });

    await provider.complete({
      messages: sampleMessages,
      systemPrompt: "Extra system instruction.",
    });

    const callArgs = anthropicMockCreate.mock.calls[0]![0];
    const systemText = extractSystemText(callArgs.system);
    expect(systemText).toContain("Extra system instruction.");
    expect(systemText).toContain("You are a helpful agent.");
  });

  it("should validate key successfully", async () => {
    anthropicMockModelsList.mockResolvedValueOnce({ data: [] });
    expect(await provider.validateKey()).toBe(true);
  });

  it("should return false for invalid key", async () => {
    anthropicMockModelsList.mockRejectedValueOnce(new Error("Unauthorized"));
    expect(await provider.validateKey()).toBe(false);
  });
});

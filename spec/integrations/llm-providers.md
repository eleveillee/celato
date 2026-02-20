# LLM Provider Reference

> **Purpose:** Comparison of model providers for Celato's whisper transformation use case.
> Updated 2026-02-20. Re-benchmark when adding a new provider or when pricing changes.
>
> **Decisions:** D-013-LLM (multi-model architecture), D-014-LAT (latency optimization)

---

## Use Case Profile

Celato's LLM calls are **short-in, short-out with strict latency requirements**:

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Input tokens** | ~930 | System prompt (~400) + conversation context (~500) + whisper (~30) |
| **Output tokens** | ~50 | Transformed natural speech (1-2 sentences) |
| **Latency budget** | <500ms typical | Part of 1-2s total whisper-to-speech pipeline |
| **Streaming** | Required | Retell starts TTS on first sentence boundary |
| **Concurrency** | Low (1 per call) | One active LLM request per call session |
| **Volume estimate** | ~10-50 whispers/call | Typical call has 10-50 turn boundaries |

---

## Cost Comparison (Per Whisper)

Assumes **930 input tokens, 50 output tokens** per whisper transformation.

| Model | Input $/M | Output $/M | Input Cost | Output Cost | **Total/Whisper** | vs GPT-4o-mini |
|-------|-----------|------------|------------|-------------|-------------------|----------------|
| **GPT-4.1-nano** | $0.10 | $0.40 | $0.000093 | $0.000020 | **$0.000113** | 34% cheaper |
| **Gemini 2.0 Flash** | $0.10 | $0.40 | $0.000093 | $0.000020 | **$0.000113** | 34% cheaper |
| **DeepSeek V3** | $0.14 | $0.28 | $0.000130 | $0.000014 | **$0.000144** | 15% cheaper |
| ⭐ **GPT-4o-mini** | $0.15 | $0.60 | $0.000140 | $0.000030 | **$0.000170** | baseline |
| **Gemini 2.5 Flash** | $0.30 | $2.50 | $0.000279 | $0.000125 | **$0.000404** | 2.4x more |
| **Groq (Llama 3.3 70B)** | $0.59 | $0.79 | $0.000549 | $0.000040 | **$0.000589** | 3.5x more |
| **Claude Haiku 4.5** | $1.00 | $5.00 | $0.000930 | $0.000250 | **$0.001180** | 6.9x more |

### Cost at Scale

| Volume | GPT-4.1-nano | GPT-4o-mini | Gemini 2.5 Flash | Claude Haiku 4.5 |
|--------|-------------|-------------|------------------|------------------|
| 100 whispers/day | $0.01 | $0.02 | $0.04 | $0.12 |
| 1,000 whispers/day | $0.11 | $0.17 | $0.40 | $1.18 |
| 10,000 whispers/day | $1.13 | $1.70 | $4.04 | $11.80 |
| 100,000 whispers/day | $11.30 | $17.00 | $40.40 | $118.00 |

**Takeaway:** At realistic early volumes (100-1,000 whispers/day), the cost difference between
all providers is **under $1/day**. Cost only matters at 10K+ daily whispers. Focus on latency
and quality for VS-1.

### Prompt Caching Impact

Providers that cache repeated system prompts (the ~400 token persona instruction):

| Provider | Cache Discount | Cached Input $/M | Effective Total/Whisper |
|----------|---------------|------------------|-------------------------|
| **OpenAI (4o-mini, 4.1-*)** | 50% off cached input | $0.075 (4o-mini) | ~$0.000155 |
| **Anthropic (Haiku 4.5)** | 90% off cached input | $0.10 | ~$0.000643 |
| **DeepSeek V3** | 90% off cached input | $0.014 | ~$0.000088 |
| **Gemini** | Not available (context caching is different) | N/A | No change |

OpenAI prompt caching is **automatic** (no code changes). Anthropic requires explicit cache
breakpoints. DeepSeek automatic. This gives OpenAI a slight edge in real-world cost.

---

## Latency Comparison

| Model | TTFT (Time to First Token) | Throughput (tok/s) | Total for 50 tokens | Streaming |
|-------|----------------------------|--------------------|-----------------------|-----------|
| **Groq (Llama 3.3 70B)** | ~100-150ms | 300+ | ~170-315ms | Yes |
| **GPT-4.1-nano** | ~180-220ms | ~170 | ~475-515ms | Yes |
| **GPT-4o-mini** | ~200-250ms | ~150 | ~535-585ms | Yes |
| **Gemini 2.0 Flash** | ~230-280ms | ~180 | ~510-560ms | Yes |
| **Claude Haiku 4.5** | ~260-300ms | ~165 | ~565-605ms | Yes |
| **DeepSeek V3** | ~300-500ms | ~120 | ~720-920ms | Yes (variable) |

**What matters for Celato:** TTFT is critical because Retell starts TTS synthesis at the
first complete sentence. A 50-token response is typically 1 sentence, so **TTFT dominates
the total LLM latency** — throughput differences are negligible at this output length.

### Latency in Context (Full Pipeline)

```
Whisper submitted → [Network: 50-100ms] → [LLM TTFT: 200-300ms] → [LLM generation: 100-200ms]
  → [Retell TTS: 200-300ms] → Business hears response

Total: 550-900ms (with streaming, TTS starts before LLM finishes)
Effective with streaming: 450-700ms
```

---

## Quality Comparison

For Celato's specific task: transforming whisper instructions into natural conversational speech.

| Model | Instruction Following | Natural Phrasing | Persona Adherence | Multi-language | Overall |
|-------|----------------------|-------------------|-------------------|----------------|---------|
| **GPT-4o-mini** | Excellent | Excellent | Strong | Good | ⭐ Best all-round |
| **GPT-4.1-nano** | Good | Good | Good | Fair | Good for simple tasks |
| **Gemini 2.0 Flash** | Good | Good | Good | Good | Solid alternative |
| **Claude Haiku 4.5** | Excellent | Best | Excellent | Excellent | Best quality, worst price |
| **Groq (Llama 3.3 70B)** | Good | Good | Fair | Fair | Speed-focused |
| **DeepSeek V3** | Good | Good-Variable | Fair | Good (CJK strong) | Availability concerns |

### Provider Risk Assessment

| Provider | Stability | Uptime SLA | API Maturity | Risk Level |
|----------|-----------|------------|--------------|------------|
| **OpenAI** | Large company, dominant market share | 99.9% | Mature, versioned | Low |
| **Google (Gemini)** | Massive company, long-term committed | 99.9% | Mature | Low |
| **Anthropic** | Well-funded, growing | 99.5% | Mature | Low-Medium |
| **Groq** | Startup, hardware-dependent | Best-effort | Maturing | Medium |
| **DeepSeek** | Chinese company, geopolitical risk | No formal SLA | Newer | Medium-High |

---

## Recommendation

### VS-1: Ship with GPT-4o-mini

| | Option | Pros | Cons |
|---|---|---|---|
| ⭐ | **GPT-4o-mini** | Best quality/cost/latency balance, automatic prompt caching, mature streaming, proven natural speech | Not the cheapest raw price |
| 🔄 | GPT-4.1-nano | 34% cheaper, same ecosystem | Lower quality for complex whispers, newer model |
| 🔄 | Gemini 2.0 Flash | Same price as nano, 1M context | Different SDK, less proven for speech tasks |

**Rationale:** Cost is negligible at VS-1 volumes ($0.17/day at 1K whispers). Quality and
latency matter more. GPT-4o-mini has the best streaming ecosystem and prompt caching is free.

### VS-3: Two-Tier Model Strategy

| Tier | Model | Use Case | Cost/Whisper |
|------|-------|----------|--------------|
| **Parrot** (cheap) | GPT-4.1-nano | Simple confirmations, yes/no, greetings | ~$0.000113 |
| **Negotiator** (quality) | GPT-4o-mini (or GPT-4o) | Complex negotiations, multi-language, nuanced | ~$0.000170+ |

Auto-switch between tiers based on conversation complexity (D-013-LLM).

### Failover Strategy

| Primary | Failover | When |
|---------|----------|------|
| GPT-4o-mini | Gemini 2.0 Flash | OpenAI outage (different infrastructure = true redundancy) |
| GPT-4.1-nano | Gemini 2.0 Flash | Same price tier, different provider |

Using Gemini as failover gives infrastructure diversity (Google vs OpenAI) without
requiring Anthropic's 7x higher pricing.

---

## Integration Notes

### OpenAI (Current / Primary)
- **SDK:** `openai` npm package
- **Streaming:** `stream: true` on chat completions
- **Prompt caching:** Automatic for repeated system prompts (50% discount, no code changes)
- **Auth:** Bearer token via `OPENAI_API_KEY` env var

### Google Gemini (Planned Failover)
- **SDK:** `@google/generative-ai` npm package
- **Streaming:** `generateContentStream()` method
- **Prompt caching:** Context caching API (different from OpenAI — requires explicit setup)
- **Auth:** API key via `GEMINI_API_KEY` env var

### Groq (Optional Speed Tier)
- **SDK:** `groq-sdk` npm package (OpenAI-compatible API)
- **Streaming:** Same interface as OpenAI (`stream: true`)
- **Prompt caching:** Not available
- **Auth:** Bearer token via `GROQ_API_KEY` env var
- **Note:** OpenAI-compatible API means minimal code changes to add

---

## Pricing Sources (Last Verified: 2026-02-20)

- [OpenAI Pricing](https://pricepertoken.com/pricing-page/provider/openai)
- [Anthropic Claude Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Google Gemini Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [DeepSeek Pricing](https://api-docs.deepseek.com/quick_start/pricing)
- [Groq Pricing](https://groq.com/pricing)
- [LLM Benchmark Leaderboard](https://artificialanalysis.ai/leaderboards/models)

> **Re-benchmark trigger:** Re-run this comparison when any provider announces >20% price
> change, when a new model generation launches, or before each VS milestone starts.

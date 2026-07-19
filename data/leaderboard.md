# LLM Gateway Benchmark — Leaderboard

> **⚠️ SAMPLE / ILLUSTRATIVE DATA — not a real measurement.**
> These numbers are placeholders so the table renders. To publish real,
> reproducible results, set the `DAOXE_API_KEY` repo secret and `DAOXE_MODELS`
> repo variable, then run the `benchmark` workflow. Budget needed to run live: `{{NEEDS_BENCHMARK_BUDGET}}`.

- Mode: **SAMPLE**
- Generated: 2026-07-20T00:00:00.000Z
- Endpoint: https://daoxe.com/v1/chat/completions
- Repeats per model: 5 · max_tokens: 8

| Model (example id) | Requests | Success % | p50 ms | p95 ms | avg ms | $/1M in | $/1M out |
| --- | --- | --- | --- | --- | --- | --- | --- |
| example/gpt-4o-mini | 5 | 100% | 373 | 437 | 382 | {{CONFIRM_PRICING}} | {{CONFIRM_PRICING}} |
| example/gemini-2.5-flash | 5 | 100% | 401 | 414 | 388 | {{CONFIRM_PRICING}} | {{CONFIRM_PRICING}} |
| example/claude-haiku | 5 | 100% | 454 | 457 | 448 | {{CONFIRM_PRICING}} | {{CONFIRM_PRICING}} |
| example/gpt-4o | 5 | 100% | 667 | 740 | 678 | {{CONFIRM_PRICING}} | {{CONFIRM_PRICING}} |
| example/doubao-pro | 5 | 100% | 718 | 761 | 699 | {{CONFIRM_PRICING}} | {{CONFIRM_PRICING}} |
| example/qwen-max | 5 | 100% | 737 | 820 | 758 | {{CONFIRM_PRICING}} | {{CONFIRM_PRICING}} |
| example/gemini-2.5-pro | 5 | 100% | 794 | 912 | 824 | {{CONFIRM_PRICING}} | {{CONFIRM_PRICING}} |
| example/kimi-k2 | 5 | 100% | 885 | 1001 | 886 | {{CONFIRM_PRICING}} | {{CONFIRM_PRICING}} |
| example/deepseek-v3 | 5 | 100% | 916 | 1003 | 898 | {{CONFIRM_PRICING}} | {{CONFIRM_PRICING}} |
| example/claude-sonnet | 5 | 100% | 955 | 978 | 911 | {{CONFIRM_PRICING}} | {{CONFIRM_PRICING}} |

Prices shown are per 1,000,000 tokens and come from `data/pricing.json`.
`{{CONFIRM_PRICING}}` means the price still needs to be confirmed by the DaoXE team.
Report excludes API keys, prompts, and response text by construction.

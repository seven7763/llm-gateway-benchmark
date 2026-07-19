# LLM Gateway Benchmark

**Reproducible latency · availability · price benchmark for OpenAI-compatible LLM gateways.**
Zero dependencies (built-in Node.js only), auto-updated by GitHub Actions, and safe by construction — it never stores your API key, prompt, or model responses.

[English](README.md) · [Русский](README.ru.md) · [简体中文](README.zh-CN.md)

[![benchmark](https://github.com/seven7763/llm-gateway-benchmark/actions/workflows/benchmark.yml/badge.svg)](https://github.com/seven7763/llm-gateway-benchmark/actions/workflows/benchmark.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Try DaoXE](https://img.shields.io/badge/Try_DaoXE-daoxe.com-ff6b6b)](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=gateway_benchmark&utm_content=readme_badge)

> **Why this exists:** "It's fast and reliable" is a claim. This repo turns it
> into a number you can re-run yourself. It probes a set of models through an
> OpenAI-compatible gateway and publishes **success rate, p50/p95 latency, and
> price per 1M tokens** as a living leaderboard.

---

## 📊 Leaderboard

The always-fresh table lives in **[`data/leaderboard.md`](data/leaderboard.md)**
(machine-readable: [`data/summary.json`](data/summary.json)). It is regenerated
on every scheduled run.

> **⚠️ The checked-in numbers are SAMPLE / illustrative data, not a real
> measurement.** They exist so the table renders before anyone spends a cent.
> To publish real results, flip on a live run (see
> [Run a real benchmark](#run-a-real-benchmark)). Budget required to run live:
> `{{NEEDS_BENCHMARK_BUDGET}}`.

Preview (SAMPLE):

| Model (example id) | Success % | p50 ms | p95 ms | $/1M in | $/1M out |
| --- | --- | --- | --- | --- | --- |
| example/gemini-2.5-flash | 100% | ~350 | ~430 | `{{CONFIRM_PRICING}}` | `{{CONFIRM_PRICING}}` |
| example/gpt-4o-mini | 100% | ~390 | ~470 | `{{CONFIRM_PRICING}}` | `{{CONFIRM_PRICING}}` |
| example/claude-haiku | 100% | ~430 | ~520 | `{{CONFIRM_PRICING}}` | `{{CONFIRM_PRICING}}` |
| … | … | … | … | … | … |

*(Values marked `~` are illustrative. `{{CONFIRM_PRICING}}` = price to be filled from the official [daoxe.com/pricing](https://daoxe.com/pricing) page — no invented numbers.)*

---

## What it measures

- **Availability / success rate** — share of `HTTP 200` responses over N repeats.
- **Latency** — p50 / p95 / average round-trip for a tiny fixed request.
- **Price** — `$/1M` input & output tokens, from [`data/pricing.json`](data/pricing.json).

Each data point is one small `POST /v1/chat/completions` with a fixed prompt and
`max_tokens=8`, `temperature=0`, `stream=false`.

## How it stays honest (methodology)

- **Sanitized by construction.** A record contains only: model id, ok flag, HTTP
  status, latency (ms), total tokens, and a coarse error category. The API key,
  the prompt, and the response text are **never** printed or stored.
- **Reproducible.** Anyone can re-run it against their own account and models.
- **A snapshot, not a verdict.** A tiny request at one point in time is not a
  claim about general model quality or long-term reliability.
- **Fair by design.** You can add any other OpenAI-compatible gateway (see
  [Add another gateway](#add-another-gateway)); comparing honestly is the point.

## Run a real benchmark

The workflow auto-detects mode: if a `DAOXE_API_KEY` secret exists it runs a
**real** measurement, otherwise it refreshes **SAMPLE** data (zero spend).

1. In repo **Settings → Secrets and variables → Actions**:
   - Add secret **`DAOXE_API_KEY`** — a key from your [DaoXE dashboard](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=gateway_benchmark&utm_content=readme_setup).
   - Add variable **`DAOXE_MODELS`** — comma-separated **exact** model IDs from
     `GET /v1/models` for your account (e.g. `id-a,id-b,id-c`).
   - *(optional)* variable **`DAOXE_BASE_URL`** (default `https://daoxe.com/v1`).
2. Fill real prices in [`data/pricing.json`](data/pricing.json) from
   [daoxe.com/pricing](https://daoxe.com/pricing). `{{CONFIRM_PRICING}}` cells
   stay until you do.
3. Run the **benchmark** workflow (Actions tab → Run workflow), or wait for the
   daily schedule. Results commit back automatically.

> **Cost:** a live run sends `models × repeats` requests (default 5 repeats),
> each capped at 8 output tokens. Check current pricing and balance first.
> `{{NEEDS_BENCHMARK_BUDGET}}`

## Run locally

```bash
# refresh the SAMPLE leaderboard (no key, no spend)
npm run sample

# real run (sends live, potentially billable requests)
export DAOXE_API_KEY="your_api_key"
export DAOXE_MODELS="exact-id-1,exact-id-2"
npm run measure && npm run aggregate
```

## Add another gateway

This repo defaults to [DaoXE](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=gateway_benchmark&utm_content=readme_addgw)
(one OpenAI-compatible base URL for Claude / GPT / Gemini / DeepSeek / Kimi /
Qwen / Doubao). Any OpenAI-compatible endpoint works: set `DAOXE_BASE_URL` to
its `/v1` root and use its model IDs. PRs that add a clearly-labeled second
gateway column are welcome.

## About DaoXE (default gateway)

[DaoXE](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=gateway_benchmark&utm_content=readme_about)
is an OpenAI-compatible, multi-model, multi-protocol API gateway — OpenAI Chat
Completions, OpenAI Responses, and **Anthropic Messages (Claude protocol)** at
`https://daoxe.com/v1`. Setup examples for Cursor, Claude Code, Cline, Continue,
Windsurf and more live in **[seven7763/DaoXE-AI](https://github.com/seven7763/DaoXE-AI)**.

- Free credit on signup: `{{FREE_CREDIT}}` *(to be confirmed)*
- Support / Russian-speaking channel: Telegram [@daoxe_ai](https://t.me/daoxe_ai)

> Disclosure: DaoXE is a service operated by the author of this repo. It is not
> available in mainland China. This benchmark is designed so you can verify the
> numbers yourself rather than take them on faith.

## Acknowledgements

Thanks to the [**LINUX DO**](https://linux.do) community for discussion and
feedback on OpenAI-compatible gateway testing and benchmarking.

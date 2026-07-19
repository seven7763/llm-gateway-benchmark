# LLM 网关 Benchmark（大模型中转延迟/可用性/价格实测）

**面向 OpenAI 兼容大模型网关的可复现 延迟 / 可用性 / 价格 基准测试。**
零依赖（仅用 Node.js 内置能力），由 GitHub Actions 自动更新；设计上安全——
**绝不保存 API key、prompt 或模型响应**。

[English](README.md) · [Русский](README.ru.md) · [简体中文](README.zh-CN.md)

[![Try DaoXE](https://img.shields.io/badge/立即使用_DaoXE-daoxe.com-ff6b6b)](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=gateway_benchmark&utm_content=readme_badge&utm_term=zh)

> **为什么做这个：**"又快又稳"是口号；这个仓库把它变成你能自己复现的数字。
> 它通过一个 OpenAI 兼容网关探测一组模型，并把 **成功率、p50/p95 延迟、每百万
> token 价格** 发布成一张持续更新的榜单。

## 📊 榜单

最新表格见 **[`data/leaderboard.md`](data/leaderboard.md)**（机器可读：
[`data/summary.json`](data/summary.json)），每次定时运行都会重新生成。

> **⚠️ 仓库内的数字是「示例/占位」数据，并非真实测量。** 它们只是让表格在没有
> 任何花费前也能显示。要发布真实结果，请开启实测（见下）。实测所需预算：
> `{{NEEDS_BENCHMARK_BUDGET}}`。

## 测什么

- **可用性/成功率** — N 次重复中 `HTTP 200` 的占比。
- **延迟** — 一个极小固定请求的 p50 / p95 / 平均往返耗时。
- **价格** — 每百万 token 的 `$/1M` 输入与输出，来自 [`data/pricing.json`](data/pricing.json)。

## 如何跑真实 benchmark

工作流自动判断模式：存在 `DAOXE_API_KEY` secret 则跑**真实**测量，否则刷新
**示例**数据（零花费）。

1. 在 **Settings → Secrets and variables → Actions**：
   - secret **`DAOXE_API_KEY`** — 你的 [DaoXE](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=gateway_benchmark&utm_content=readme_setup&utm_term=zh) 面板里的 key；
   - variable **`DAOXE_MODELS`** — 从 `GET /v1/models` 取到的**精确**模型 ID，逗号分隔；
   - *(可选)* variable **`DAOXE_BASE_URL`**（默认 `https://daoxe.com/v1`）。
2. 到 [daoxe.com/pricing](https://daoxe.com/pricing) 把真实价格填入
   [`data/pricing.json`](data/pricing.json)；未填的显示 `{{CONFIRM_PRICING}}`。
3. 在 Actions 里手动运行 **benchmark** 或等每日定时。结果自动 commit 回仓库。

## 关于 DaoXE（默认网关）

[DaoXE](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=gateway_benchmark&utm_content=readme_about&utm_term=zh)
是一个 OpenAI 兼容、多模型、多协议的 API 网关：在 `https://daoxe.com/v1` 上提供
OpenAI Chat Completions、OpenAI Responses 与 **Anthropic Messages（Claude 原生
协议）**。一个 base URL、一个 key 接入 Claude / GPT / Gemini / DeepSeek / Kimi /
通义 / 豆包。Cursor、Claude Code、Cline 等接入示例见
**[seven7763/DaoXE-AI](https://github.com/seven7763/DaoXE-AI)**。

- 注册赠送额度：`{{FREE_CREDIT}}`（待确认）
- 客服 / 华人开发者频道：Telegram [@daoxe_ai](https://t.me/daoxe_ai)

> 披露：DaoXE 是本仓库作者运营的服务，在中国大陆不可用。本 benchmark 的设计目标
> 就是让你能自己复现数字，而不是听信口号。

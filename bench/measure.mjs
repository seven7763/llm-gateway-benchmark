#!/usr/bin/env node
// Safe latency / availability probe for an OpenAI-compatible gateway.
//
// It NEVER prints or stores the API key, the prompt, or the model response.
// Each raw record contains only: model id, ok flag, HTTP status, latency (ms),
// total tokens, and a coarse error category. Reuses the same auditable request
// shape as seven7763/DaoXE-AI/benchmark.mjs.
//
// Usage:
//   DAOXE_API_KEY=... DAOXE_MODELS="id1,id2" node bench/measure.mjs --repeats 5 --out data/results/latest.json
//
// Cost: sends (models x repeats) live requests, each capped at --max-tokens
// (default 8). Check current pricing and balance before running.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const DEFAULT_BASE_URL = "https://daoxe.com/v1";
const DEFAULT_MAX_TOKENS = 8;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_REPEATS = 5;
const FIXED_PROMPT = "Reply with exactly: OK";

function parseArgs(argv) {
  const opts = {
    repeats: DEFAULT_REPEATS,
    maxTokens: DEFAULT_MAX_TOKENS,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    out: "data/results/latest.json",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--repeats") opts.repeats = Number(argv[++i]);
    else if (a === "--max-tokens") opts.maxTokens = Number(argv[++i]);
    else if (a === "--timeout-ms") opts.timeoutMs = Number(argv[++i]);
    else if (a === "--out") opts.out = argv[++i];
  }
  if (!Number.isInteger(opts.repeats) || opts.repeats < 1 || opts.repeats > 50) {
    throw new Error("--repeats must be an integer between 1 and 50");
  }
  if (!Number.isInteger(opts.maxTokens) || opts.maxTokens < 1 || opts.maxTokens > 64) {
    throw new Error("--max-tokens must be an integer between 1 and 64");
  }
  return opts;
}

function normalizeTotalTokens(usage = {}) {
  const total = usage.total_tokens;
  if (Number.isFinite(total)) return total;
  const p = usage.prompt_tokens ?? usage.input_tokens;
  const c = usage.completion_tokens ?? usage.output_tokens;
  if (Number.isFinite(p) && Number.isFinite(c)) return p + c;
  return null;
}

async function requestOnce({ model, apiKey, baseUrl, maxTokens, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = performance.now();
  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: FIXED_PROMPT }],
        max_tokens: maxTokens,
        temperature: 0,
        stream: false,
      }),
      signal: controller.signal,
    });
    const latencyMs = Math.round(performance.now() - startedAt);
    if (!response.ok) {
      try { await response.body?.cancel?.(); } catch { /* status still useful */ }
      return { model, ok: false, status: response.status, latency_ms: latencyMs, total_tokens: null, error: "http_error" };
    }
    let data;
    try { data = await response.json(); } catch {
      return { model, ok: false, status: response.status, latency_ms: latencyMs, total_tokens: null, error: "invalid_json" };
    }
    if (!Array.isArray(data?.choices) || data.choices.length === 0) {
      return { model, ok: false, status: response.status, latency_ms: latencyMs, total_tokens: normalizeTotalTokens(data?.usage), error: "invalid_response" };
    }
    return { model, ok: true, status: response.status, latency_ms: latencyMs, total_tokens: normalizeTotalTokens(data.usage), error: null };
  } catch (error) {
    return {
      model,
      ok: false,
      status: null,
      latency_ms: Math.round(performance.now() - startedAt),
      total_tokens: null,
      error: error?.name === "AbortError" ? "timeout" : "network_error",
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const apiKey = process.env.DAOXE_API_KEY;
  if (!apiKey) {
    throw new Error("DAOXE_API_KEY is required (from the environment). Set it as a repo secret to run a real benchmark. {{NEEDS_BENCHMARK_BUDGET}}");
  }
  const baseUrl = process.env.DAOXE_BASE_URL || DEFAULT_BASE_URL;
  const models = (process.env.DAOXE_MODELS || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  if (models.length === 0) {
    throw new Error("Set DAOXE_MODELS to a comma-separated list of exact model IDs from GET /v1/models for your account.");
  }

  console.error(
    `Cost notice: sending ${models.length * opts.repeats} live request(s) ` +
      `(${models.length} models x ${opts.repeats} repeats), max_tokens=${opts.maxTokens}. ` +
      `Check current DaoXE pricing and balance first.`,
  );

  const records = [];
  for (const model of models) {
    for (let r = 0; r < opts.repeats; r += 1) {
      records.push(await requestOnce({ model, apiKey, baseUrl, maxTokens: opts.maxTokens, timeoutMs: opts.timeoutMs }));
    }
  }

  const report = {
    schema: 1,
    mode: "real",
    created_at: new Date().toISOString(),
    endpoint: `${baseUrl.replace(/\/+$/, "")}/chat/completions`,
    max_tokens: opts.maxTokens,
    repeats: opts.repeats,
    records,
  };
  await mkdir(dirname(opts.out), { recursive: true });
  await writeFile(opts.out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.error(`Wrote ${records.length} sanitized records to ${opts.out}`);
}

main().catch((error) => {
  console.error(`measure failed: ${error.message}`);
  process.exitCode = 1;
});

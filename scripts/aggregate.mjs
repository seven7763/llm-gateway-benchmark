#!/usr/bin/env node
// Aggregate raw probe records into a leaderboard (success rate, p50/p95 latency,
// price per 1M tokens) and render Markdown + JSON summary.
//
// Usage:
//   node scripts/aggregate.mjs --in data/results/latest.json \
//     --pricing data/pricing.json --out data/leaderboard.md --summary data/summary.json

import { readFile, writeFile } from "node:fs/promises";

function parseArgs(argv) {
  const opts = {
    in: "data/results/latest.json",
    pricing: "data/pricing.json",
    out: "data/leaderboard.md",
    summary: "data/summary.json",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--in") opts.in = argv[++i];
    else if (a === "--pricing") opts.pricing = argv[++i];
    else if (a === "--out") opts.out = argv[++i];
    else if (a === "--summary") opts.summary = argv[++i];
  }
  return opts;
}

function percentile(sortedAsc, p) {
  if (sortedAsc.length === 0) return null;
  if (sortedAsc.length === 1) return sortedAsc[0];
  const rank = (p / 100) * (sortedAsc.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return sortedAsc[low];
  const weight = rank - low;
  return Math.round(sortedAsc[low] * (1 - weight) + sortedAsc[high] * weight);
}

function priceCell(value) {
  if (value === null || value === undefined || value === "") return "{{CONFIRM_PRICING}}";
  return `$${Number(value).toFixed(2)}`;
}

function fmt(value, suffix = "") {
  return value === null || value === undefined ? "-" : `${value}${suffix}`;
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

function aggregate(report, pricing) {
  const byModel = new Map();
  for (const rec of report.records ?? []) {
    if (!byModel.has(rec.model)) byModel.set(rec.model, []);
    byModel.get(rec.model).push(rec);
  }
  const rows = [];
  for (const [model, recs] of byModel) {
    const n = recs.length;
    const okRecs = recs.filter((r) => r.ok);
    const successRate = n ? Math.round((okRecs.length / n) * 1000) / 10 : null;
    const latencies = okRecs.map((r) => r.latency_ms).filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
    const price = pricing?.[model] ?? {};
    rows.push({
      model,
      requests: n,
      success_rate: successRate,
      p50_ms: percentile(latencies, 50),
      p95_ms: percentile(latencies, 95),
      avg_ms: latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null,
      input_per_m: price.input_per_1m ?? null,
      output_per_m: price.output_per_1m ?? null,
    });
  }
  // Sort by success desc, then p50 asc (nulls last).
  rows.sort((a, b) => {
    if ((b.success_rate ?? -1) !== (a.success_rate ?? -1)) return (b.success_rate ?? -1) - (a.success_rate ?? -1);
    return (a.p50_ms ?? Infinity) - (b.p50_ms ?? Infinity);
  });
  return rows;
}

function renderMarkdown(report, rows) {
  const isSample = report.mode !== "real";
  const banner = isSample
    ? "> **⚠️ SAMPLE / ILLUSTRATIVE DATA — not a real measurement.**\n" +
      "> These numbers are placeholders so the table renders. To publish real,\n" +
      "> reproducible results, set the `DAOXE_API_KEY` repo secret and `DAOXE_MODELS`\n" +
      "> repo variable, then run the `benchmark` workflow. Budget needed to run live: `{{NEEDS_BENCHMARK_BUDGET}}`."
    : "> Live measurement. Small fixed request per data point; a snapshot in time,\n" +
      "> not a claim about general model quality.";

  const header = ["Model (example id)", "Requests", "Success %", "p50 ms", "p95 ms", "avg ms", "$/1M in", "$/1M out"];
  const lines = [
    "# LLM Gateway Benchmark — Leaderboard",
    "",
    banner,
    "",
    `- Mode: **${isSample ? "SAMPLE" : "REAL"}**`,
    `- Generated: ${report.created_at ?? "-"}`,
    `- Endpoint: ${report.endpoint ?? "https://daoxe.com/v1/chat/completions"}`,
    `- Repeats per model: ${report.repeats ?? "-"} · max_tokens: ${report.max_tokens ?? "-"}`,
    "",
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...rows.map((r) =>
      `| ${[
        r.model,
        r.requests,
        fmt(r.success_rate, "%"),
        fmt(r.p50_ms),
        fmt(r.p95_ms),
        fmt(r.avg_ms),
        priceCell(r.input_per_m),
        priceCell(r.output_per_m),
      ].join(" | ")} |`,
    ),
    "",
    "Prices shown are per 1,000,000 tokens and come from `data/pricing.json`.",
    "`{{CONFIRM_PRICING}}` means the price still needs to be confirmed by the DaoXE team.",
    "Report excludes API keys, prompts, and response text by construction.",
    "",
  ];
  return lines.join("\n");
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const report = await readJson(opts.in, { mode: "sample", records: [] });
  const pricing = await readJson(opts.pricing, {});
  const rows = aggregate(report, pricing);
  const markdown = renderMarkdown(report, rows);
  await writeFile(opts.out, markdown, "utf8");
  await writeFile(
    opts.summary,
    `${JSON.stringify({ mode: report.mode ?? "sample", created_at: report.created_at, rows }, null, 2)}\n`,
    "utf8",
  );
  console.error(`Wrote leaderboard to ${opts.out} and summary to ${opts.summary} (${rows.length} models).`);
}

main().catch((error) => {
  console.error(`aggregate failed: ${error.message}`);
  process.exitCode = 1;
});

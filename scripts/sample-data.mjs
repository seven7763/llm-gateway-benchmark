#!/usr/bin/env node
// Generate clearly-labeled SAMPLE records so the leaderboard renders before any
// real, budgeted benchmark has run. These are NOT real measurements. Replace by
// running bench/measure.mjs with a real DAOXE_API_KEY + DAOXE_MODELS.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

function parseArgs(argv) {
  const opts = { out: "data/results/latest.json", models: "data/models.json", repeats: 5 };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--out") opts.out = argv[++i];
    else if (a === "--models") opts.models = argv[++i];
    else if (a === "--repeats") opts.repeats = Number(argv[++i]);
  }
  return opts;
}

// Deterministic pseudo-random so sample output is stable between runs.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const models = JSON.parse(await readFile(opts.models, "utf8"));
  const rand = mulberry32(20260720);
  const records = [];
  for (const entry of models) {
    const base = entry.sample_latency_ms ?? 700;
    for (let r = 0; r < opts.repeats; r += 1) {
      const jitter = Math.round((rand() - 0.3) * base * 0.4);
      records.push({
        model: entry.id,
        ok: true,
        status: 200,
        latency_ms: Math.max(120, base + jitter),
        total_tokens: 12,
        error: null,
      });
    }
  }
  const report = {
    schema: 1,
    mode: "sample",
    created_at: new Date().toISOString(),
    endpoint: "https://daoxe.com/v1/chat/completions",
    max_tokens: 8,
    repeats: opts.repeats,
    note: "SAMPLE data — illustrative only, not a real measurement. {{NEEDS_BENCHMARK_BUDGET}}",
    records,
  };
  await mkdir(dirname(opts.out), { recursive: true });
  await writeFile(opts.out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.error(`Wrote ${records.length} SAMPLE records to ${opts.out} (illustrative only).`);
}

main().catch((error) => {
  console.error(`sample-data failed: ${error.message}`);
  process.exitCode = 1;
});

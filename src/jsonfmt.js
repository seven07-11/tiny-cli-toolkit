#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const INDENT = 2;

async function readInput(path) {
  if (path) return readFile(path, "utf8");
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export function formatJson(raw) {
  if (!raw.trim()) throw new Error("empty input");
  return JSON.stringify(JSON.parse(raw), null, INDENT);
}

async function main() {
  const raw = await readInput(process.argv[2]);
  process.stdout.write(formatJson(raw) + "\n");
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  main().catch((error) => {
    const where = process.argv[2] || "<stdin>";
    process.stderr.write(`jsonfmt: ${where}: ${error.message}\n`);
    process.exitCode = 1;
  });
}

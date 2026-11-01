#!/usr/bin/env node
import { opendir, stat } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SKIP = new Set(["node_modules", ".git", "dist", "build"]);

export async function walk(dir, out = []) {
  let handle;
  try {
    handle = await opendir(dir);
  } catch (error) {
    if (error.code === "ENOENT") return out;
    throw error;
  }
  for await (const entry of handle) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP.has(entry.name)) continue;
      await walk(full, out);
    } else if (entry.isFile()) {
      const info = await stat(full);
      out.push({ path: full, bytes: info.size });
    }
  }
  return out;
}

export function human(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)}${units[unit]}`;
}

export function topFiles(files, limit) {
  return [...files].sort((a, b) => b.bytes - a.bytes).slice(0, limit);
}

async function main() {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith("--")) || ".";
  const limitIndex = args.indexOf("--limit");
  const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) || 20 : 20;

  const files = await walk(dir);
  for (const file of topFiles(files, limit)) {
    process.stdout.write(`${human(file.bytes).padStart(9)}  ${file.path}\n`);
  }
  const total = files.reduce((sum, f) => sum + f.bytes, 0);
  process.stdout.write(`\n${files.length} files, ${human(total)} total\n`);
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  main().catch((error) => {
    process.stderr.write(`sizes: ${error.message}\n`);
    process.exitCode = 1;
  });
}

#!/usr/bin/env node
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { walk } from "./sizes.js";

export function hashFile(path) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    createReadStream(path)
      .on("error", reject)
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => resolve(hash.digest("hex")));
  });
}

export async function findDuplicates(dir) {
  const files = await walk(dir);

  // Group by size first: different sizes can never be duplicates.
  const bySize = new Map();
  for (const file of files) {
    if (file.bytes === 0) continue;
    if (!bySize.has(file.bytes)) bySize.set(file.bytes, []);
    bySize.get(file.bytes).push(file.path);
  }

  const groups = new Map();
  for (const paths of bySize.values()) {
    if (paths.length < 2) continue;
    for (const path of paths) {
      const digest = await hashFile(path);
      if (!groups.has(digest)) groups.set(digest, []);
      groups.get(digest).push(path);
    }
  }

  return [...groups.entries()].filter(([, paths]) => paths.length > 1);
}

async function main() {
  const groups = await findDuplicates(process.argv[2] || ".");
  if (!groups.length) {
    process.stdout.write("no duplicates found\n");
    return;
  }
  for (const [digest, paths] of groups) {
    process.stdout.write(`duplicate ${digest.slice(0, 12)}:\n`);
    for (const path of paths) process.stdout.write(`  ${path}\n`);
  }
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  main().catch((error) => {
    process.stderr.write(`dupes: ${error.message}\n`);
    process.exitCode = 1;
  });
}

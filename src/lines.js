#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname } from "node:path";
import { pathToFileURL } from "node:url";

const LINE_COMMENT = {
  ".js": "line",
  ".mjs": "line",
  ".cjs": "line",
  ".ts": "line",
  ".tsx": "line",
  ".jsx": "line",
  ".go": "line",
  ".rs": "line",
  ".c": "line",
  ".h": "line",
  ".cpp": "line",
  ".py": "hash",
  ".rb": "hash",
  ".sh": "hash",
  ".yml": "hash",
  ".yaml": "hash",
  ".toml": "hash",
  ".sql": "line",
};

function countLines(text, ext = "") {
  const kind = LINE_COMMENT[ext] || "line";
  const lines = text.split(/\r?\n/);
  const result = { total: lines.length, blank: 0, comment: 0, code: 0 };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      result.blank += 1;
      continue;
    }
    const isComment =
      kind === "hash"
        ? line.startsWith("#") || line.startsWith("//")
        : line.startsWith("//") || line.startsWith("/*") || line.startsWith("*");
    if (isComment) {
      result.comment += 1;
    } else {
      result.code += 1;
    }
  }
  return result;
}

async function summarize(paths) {
  const totals = { total: 0, blank: 0, comment: 0, code: 0, files: 0 };

  for (const p of paths) {
    if (!existsSync(p)) {
      throw new Error(`no such file: ${p}`);
    }
    const text = await readFile(p, "utf8");
    const stats = countLines(text, extname(p).toLowerCase());
    totals.files += 1;
    totals.total += stats.total;
    totals.blank += stats.blank;
    totals.comment += stats.comment;
    totals.code += stats.code;
  }
  return totals;
}

function formatTable(results) {
  const header = "file                     total  blank  comment  code";
  const lines = [header, "-".repeat(header.length)];
  for (const [name, s] of results) {
    const nameCol = (name.length > 22 ? name.slice(0, 19) + "..." : name).padEnd(22);
    lines.push(
      `${nameCol} ${String(s.total).padStart(6)} ${String(s.blank).padStart(6)} ${String(
        s.comment,
      ).padStart(7)} ${String(s.code).padStart(5)}`,
    );
  }
  return lines.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("usage: lines <file> [<file> ...]");
    process.exit(2);
  }
  const results = [];
  const totals = { total: 0, blank: 0, comment: 0, code: 0, files: 0 };
  for (const p of args) {
    const s = await summarize([p]);
    results.push([p, s]);
    totals.files += s.files;
    totals.total += s.total;
    totals.blank += s.blank;
    totals.comment += s.comment;
    totals.code += s.code;
  }
  console.log(formatTable(results));
  console.log("—".repeat(36));
  console.log(
    `${"TOTAL".padEnd(22)} ${String(totals.total).padStart(6)} ${String(totals.blank).padStart(
      6,
    )} ${String(totals.comment).padStart(7)} ${String(totals.code).padStart(5)}`,
  );
}

export { countLines, summarize, formatTable };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

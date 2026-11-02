import test from "node:test";
import assert from "node:assert/strict";
import { countLines, formatTable } from "../src/lines.js";

test("counts a simple JS file", () => {
  const src = [
    "const a = 1; // inline ignored",
    "function f() {",
    "  // a comment",
    "  return a;",
    "}",
    "",
    "f();",
  ].join("\n");
  const r = countLines(src, ".js");
  assert.equal(r.total, 7);
  assert.equal(r.blank, 1);
  assert.equal(r.comment, 1);
  assert.equal(r.code, 5);
});

test("block comment start is counted as comment", () => {
  const r = countLines("/* block */\ncode()\n", ".js");
  assert.equal(r.comment, 1);
  assert.equal(r.code, 1);
});

test("hash comments for python", () => {
  const src = "#!/usr/bin/env python\n# a comment\nx = 1\n\n\n";
  const r = countLines(src, ".py");
  assert.equal(r.total, 6);
  assert.equal(r.comment, 2);
  assert.equal(r.blank, 3);
  assert.equal(r.code, 1);
});

test("blank lines are not counted as code", () => {
  const r = countLines("\n\n", ".js");
  assert.equal(r.total, 3);
  assert.equal(r.blank, 3);
  assert.equal(r.code, 0);
  assert.equal(r.comment, 0);
});

test("unknown extension treated as line comment", () => {
  const r = countLines("// c\ncode", ".txt");
  assert.equal(r.comment, 1);
  assert.equal(r.code, 1);
});

test("formatTable renders a row and total", () => {
  const out = formatTable([["a.js", { total: 6, blank: 1, comment: 1, code: 4 }]]);
  assert.match(out, /a\.js/);
  assert.match(out, /total/);
});

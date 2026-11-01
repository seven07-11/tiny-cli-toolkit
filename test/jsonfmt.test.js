import test from "node:test";
import assert from "node:assert/strict";
import { formatJson } from "../src/jsonfmt.js";

test("formats an object with two-space indent", () => {
  assert.equal(formatJson('{"a":1}'), '{\n  "a": 1\n}');
});

test("formats nested structures", () => {
  const out = formatJson('{"a":{"b":[1,2]}}');
  assert.match(out, /"b": \[/);
});

test("throws on empty input", () => {
  assert.throws(() => formatJson("   "), /empty input/);
});

test("throws on invalid JSON", () => {
  assert.throws(() => formatJson("{nope}"), SyntaxError);
});

test("round-trips arrays", () => {
  assert.equal(formatJson("[1,2]"), "[\n  1,\n  2\n]");
});

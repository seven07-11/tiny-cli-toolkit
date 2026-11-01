import test from "node:test";
import assert from "node:assert/strict";
import { human, topFiles } from "../src/sizes.js";

test("human formats bytes", () => {
  assert.equal(human(0), "0B");
  assert.equal(human(512), "512B");
  assert.equal(human(1024), "1.0KB");
  assert.equal(human(1536), "1.5KB");
  assert.equal(human(1048576), "1.0MB");
});

test("topFiles sorts descending and limits", () => {
  const files = [
    { path: "a", bytes: 1 },
    { path: "b", bytes: 300 },
    { path: "c", bytes: 50 },
  ];
  assert.deepEqual(
    topFiles(files, 2).map((f) => f.path),
    ["b", "c"],
  );
});

test("topFiles does not mutate the input", () => {
  const files = [
    { path: "a", bytes: 1 },
    { path: "b", bytes: 2 },
  ];
  topFiles(files, 5);
  assert.equal(files[0].path, "a");
});

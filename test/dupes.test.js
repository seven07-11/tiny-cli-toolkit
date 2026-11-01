import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findDuplicates, hashFile } from "../src/dupes.js";

test("detects duplicate files by content", async () => {
  const dir = await mkdtemp(join(tmpdir(), "dupes-"));
  try {
    await writeFile(join(dir, "a.txt"), "same content");
    await writeFile(join(dir, "b.txt"), "same content");
    await writeFile(join(dir, "c.txt"), "different");
    const groups = await findDuplicates(dir);
    assert.equal(groups.length, 1);
    assert.equal(groups[0][1].length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("returns empty when nothing is duplicated", async () => {
  const dir = await mkdtemp(join(tmpdir(), "dupes-"));
  try {
    await writeFile(join(dir, "only.txt"), "unique");
    assert.deepEqual(await findDuplicates(dir), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("hashFile is stable", async () => {
  const dir = await mkdtemp(join(tmpdir(), "dupes-"));
  try {
    const p = join(dir, "x.txt");
    await writeFile(p, "abc");
    assert.equal(await hashFile(p), await hashFile(p));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

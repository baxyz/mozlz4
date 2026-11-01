/**
 * Copyright (C) 2026 baxyz
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import { test } from "vitest";
import { decodeMozLz4, encodeMozLz4 } from "../src/index";

// Pre-build inputs outside bench blocks to measure only encode/decode time

const REP_1K = new Uint8Array(1024).fill(0xab);
const REP_1K_ENC = encodeMozLz4(REP_1K);

const JSON_SRC = new TextEncoder().encode(
  JSON.stringify(
    Array.from({ length: 50 }, (_, i) => ({
      index: i,
      url: `https://example.com/page/${i}`,
      title: `Page ${i}`,
      charset: "utf-8",
      hidden: false,
    })),
  ),
);
const JSON_ENC = encodeMozLz4(JSON_SRC);

const RAND_64K = Uint8Array.from({ length: 65536 }, (_, i) => (i * 37 + 13) & 0xff);
const RAND_64K_ENC = encodeMozLz4(RAND_64K);

test("encodeMozLz4: 1 KB repetitive", async ({ bench }) => {
  await bench("1 KB repetitive", () => {
    encodeMozLz4(REP_1K);
  }).run();
});

test("encodeMozLz4: ~3 KB JSON (Firefox-like)", async ({ bench }) => {
  await bench("~3 KB JSON (Firefox-like)", () => {
    encodeMozLz4(JSON_SRC);
  }).run();
});

test("encodeMozLz4: 64 KB pseudo-random", async ({ bench }) => {
  await bench("64 KB pseudo-random", () => {
    encodeMozLz4(RAND_64K);
  }).run();
});

test("decodeMozLz4: 1 KB repetitive", async ({ bench }) => {
  await bench("1 KB repetitive", () => {
    decodeMozLz4(REP_1K_ENC);
  }).run();
});

test("decodeMozLz4: ~3 KB JSON (Firefox-like)", async ({ bench }) => {
  await bench("~3 KB JSON (Firefox-like)", () => {
    decodeMozLz4(JSON_ENC);
  }).run();
});

test("decodeMozLz4: 64 KB pseudo-random", async ({ bench }) => {
  await bench("64 KB pseudo-random", () => {
    decodeMozLz4(RAND_64K_ENC);
  }).run();
});

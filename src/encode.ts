/**
 * Copyright (C) 2026 baxyz
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import { MAGIC, MAGIC_SIZE, HEADER_SIZE } from "./magic";

const HASH_BITS = 16;
const HASH_SIZE = 1 << HASH_BITS;
const HASH_MUL = 0x9e3779b1;
const MIN_MATCH = 4;
const MAX_DISTANCE = 65535;
// Per LZ4 spec: last match must start ≥12 bytes from end; last 5 bytes must be literals
const MFLIMIT = 12;
const LAST_LITERALS = 5;

function hashSeq(src: Uint8Array, pos: number): number {
  const v = src[pos] | (src[pos + 1] << 8) | (src[pos + 2] << 16) | (src[pos + 3] << 24);
  return (Math.imul(v, HASH_MUL) >>> (32 - HASH_BITS)) & (HASH_SIZE - 1);
}

function lz4BlockEncode(src: Uint8Array): Uint8Array {
  const n = src.length;
  // Worst case: all literals — 1 token byte per up-to-255 literals + data
  const dst = new Uint8Array(n + Math.ceil(n / 255) + 16);
  const table = new Int32Array(HASH_SIZE).fill(-1);

  let s = 0;
  let d = 0;
  let litStart = 0;
  const matchStartLimit = n - MFLIMIT;
  const matchExtendLimit = n - LAST_LITERALS;

  while (s < matchStartLimit) {
    const h = hashSeq(src, s);
    const ref = table[h];
    table[h] = s;

    if (
      ref >= 0 &&
      s - ref <= MAX_DISTANCE &&
      src[ref] === src[s] &&
      src[ref + 1] === src[s + 1] &&
      src[ref + 2] === src[s + 2] &&
      src[ref + 3] === src[s + 3]
    ) {
      let matchLen = MIN_MATCH;
      while (s + matchLen < matchExtendLimit && src[ref + matchLen] === src[s + matchLen]) {
        matchLen++;
      }

      const litLen = s - litStart;
      const ml = matchLen - MIN_MATCH;
      const offset = s - ref;

      const tokenPos = d++;
      dst[tokenPos] = (Math.min(litLen, 15) << 4) | Math.min(ml, 15);

      if (litLen >= 15) {
        let rem = litLen - 15;
        while (rem >= 255) {
          dst[d++] = 255;
          rem -= 255;
        }
        dst[d++] = rem;
      }

      dst.set(src.subarray(litStart, s), d);
      d += litLen;

      dst[d++] = offset & 0xff;
      dst[d++] = (offset >>> 8) & 0xff;

      if (ml >= 15) {
        let rem = ml - 15;
        while (rem >= 255) {
          dst[d++] = 255;
          rem -= 255;
        }
        dst[d++] = rem;
      }

      s += matchLen;
      litStart = s;
    } else {
      s++;
    }
  }

  // Last literal run — always emitted as literals per LZ4 spec
  const litLen = n - litStart;
  const tokenPos = d++;
  dst[tokenPos] = Math.min(litLen, 15) << 4;

  if (litLen >= 15) {
    let rem = litLen - 15;
    while (rem >= 255) {
      dst[d++] = 255;
      rem -= 255;
    }
    dst[d++] = rem;
  }

  dst.set(src.subarray(litStart), d);
  d += litLen;

  return dst.subarray(0, d);
}

/** Encodes a buffer into mozlz4 format (LZ4 block compression with `mozLz40\0` header). */
export function encodeMozLz4(data: Uint8Array): Uint8Array {
  const compressed = lz4BlockEncode(data);
  const out = new Uint8Array(HEADER_SIZE + compressed.length);
  out.set(MAGIC, 0);
  new DataView(out.buffer).setUint32(MAGIC_SIZE, data.length, true);
  out.set(compressed, HEADER_SIZE);
  return out;
}

/**
 * Copyright (C) 2026 baxyz
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import { MAGIC, HEADER_SIZE } from "./magic";

function lz4BlockDecode(src: Uint8Array, dst: Uint8Array): number {
  let s = 0;
  let d = 0;

  while (s < src.length) {
    const token = src[s++];

    let litLen = token >>> 4;
    if (litLen === 15) {
      let b: number;
      do {
        b = src[s++];
        litLen += b;
      } while (b === 255);
    }

    dst.set(src.subarray(s, s + litLen), d);
    s += litLen;
    d += litLen;

    if (s >= src.length) break;

    const offset = src[s++] | (src[s++] << 8);

    let matchLen = (token & 0x0f) + 4;
    if ((token & 0x0f) === 15) {
      let b: number;
      do {
        b = src[s++];
        matchLen += b;
      } while (b === 255);
    }

    let pos = d - offset;
    for (let i = 0; i < matchLen; i++) dst[d++] = dst[pos++];
  }

  return d;
}

/**
 * Decodes a mozlz4-encoded buffer.
 * @throws {Error} if the data is not a valid mozlz4 file
 */
export function decodeMozLz4(data: Uint8Array): Uint8Array {
  if (data.length < HEADER_SIZE) throw new Error("Not a mozlz4 file");
  for (let i = 0; i < MAGIC.length; i++) {
    if (data[i] !== MAGIC[i]) throw new Error("Not a mozlz4 file");
  }
  const size = new DataView(data.buffer, data.byteOffset + MAGIC.length, 4).getUint32(0, true);
  const out = new Uint8Array(size);
  const written = lz4BlockDecode(data.subarray(HEADER_SIZE), out);
  if (written < size) throw new Error("Not a mozlz4 file");
  return out;
}

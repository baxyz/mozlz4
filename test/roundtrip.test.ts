import { describe, it, expect } from "vitest";
import { decodeMozLz4, encodeMozLz4 } from "../src/index";

function roundtrip(input: Uint8Array): void {
  const encoded = encodeMozLz4(input);
  const decoded = decodeMozLz4(encoded);
  expect(decoded).toEqual(input);
}

describe("encode → decode roundtrip", () => {
  it("empty buffer", () => roundtrip(new Uint8Array(0)));

  it("single byte", () => roundtrip(new Uint8Array([42])));

  it("short ascii string", () => roundtrip(new TextEncoder().encode("hello world")));

  it("highly repetitive data (high compression ratio)", () => {
    roundtrip(new Uint8Array(1000).fill(0xab));
  });

  it("pseudo-random data (low compression, many literals)", () => {
    const buf = new Uint8Array(512);
    for (let i = 0; i < buf.length; i++) buf[i] = (i * 37 + 13) & 0xff;
    roundtrip(buf);
  });

  it("JSON payload", () => {
    const items = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      name: `item-${i}`,
      active: true,
    }));
    const json = JSON.stringify({ version: 1, items });
    roundtrip(new TextEncoder().encode(json));
  });

  it("data with far-apart repetition (matches across large window)", () => {
    const buf = new Uint8Array(2000);
    for (let i = 0; i < 1000; i++) buf[i] = i & 0xff;
    for (let i = 0; i < 1000; i++) buf[i + 1000] = i & 0xff;
    roundtrip(buf);
  });

  it("long literal run before first match (litLen >= 15)", () => {
    // 20 unique bytes then repeated → encoder emits extra literal-length bytes
    const unique = Uint8Array.from({ length: 20 }, (_, i) => i + 1);
    const repeat = new Uint8Array(8).fill(0xee);
    roundtrip(new Uint8Array([...unique, ...repeat, ...repeat]));
  });

  it("very long match (matchLen >= 19, ml >= 15 extra bytes)", () => {
    // Short unique prefix then a 24-byte run repeated twice → match length = 24
    const prefix = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const run = new Uint8Array(24).fill(0xbb);
    roundtrip(new Uint8Array([...prefix, ...run, ...run]));
  });

  it("input of exactly 12 bytes (near match-start limit)", () => {
    roundtrip(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]));
  });

  it("input of exactly 13 bytes", () => {
    roundtrip(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]));
  });

  it("large binary-like input", () => {
    const buf = new Uint8Array(8192);
    for (let i = 0; i < buf.length; i++) buf[i] = (i * 251 + 127) & 0xff;
    roundtrip(buf);
  });

  it("extra match length overflow (while rem>=255 in ml path)", () => {
    // ml = matchLen - 4. Need ml - 15 >= 255 → matchLen >= 274.
    // Offset-1 overlapping run: encoder finds match at s=5 (ref=4), extends to matchExtendLimit.
    // With n=600: matchExtendLimit=595, matchLen up to 595-5=590, ml=586, rem=571 → 2 while iterations.
    const run = new Uint8Array(600).fill(0xdd);
    roundtrip(run);
  });

  it("extra literal length overflow (while rem>=255 in litLen path, match-found branch)", () => {
    // Need litLen >= 270 before a match is found.
    // Use 272 bytes with guaranteed-unique 4-byte windows (strided groups),
    // then a repeat that starts within matchStartLimit so a match fires at s≈273.
    const buf = new Uint8Array(298);
    // 272 unique bytes: 68 groups of [i, 0, 0xca, 0xfe] — all 4-byte windows distinct
    for (let i = 0; i < 68; i++) {
      buf[i * 4] = i & 0xff;
      buf[i * 4 + 1] = (i >> 8) & 0xff;
      buf[i * 4 + 2] = 0xca;
      buf[i * 4 + 3] = 0xfe;
    }
    // 26 bytes of 0xbb repeated twice starting at offset 272
    buf.fill(0xbb, 272, 298);
    roundtrip(buf);
  });

  it("extra literal length overflow (while rem>=255 in last-literal-run branch)", () => {
    // Input with no matches → entire block is one last literal run with litLen=n.
    // Need n - litStart >= 270 with litStart=0 (no match found).
    // 280 unique strided bytes: all 4-byte windows are distinct, encoder finds no match.
    const buf = new Uint8Array(280);
    for (let i = 0; i < 70; i++) {
      buf[i * 4] = i & 0xff;
      buf[i * 4 + 1] = (i >> 8) & 0xff;
      buf[i * 4 + 2] = 0xde;
      buf[i * 4 + 3] = 0xad;
    }
    roundtrip(buf);
  });
});

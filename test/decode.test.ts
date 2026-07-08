import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { decodeMozLz4, encodeMozLz4 } from "../src/index";

describe("decodeMozLz4", () => {
  it("throws on invalid magic bytes", () => {
    const bad = new Uint8Array(16).fill(0x41); // "AAAA..."
    expect(() => decodeMozLz4(bad)).toThrow("Not a mozlz4 file");
  });

  it("throws when only first magic byte matches", () => {
    const buf = new Uint8Array(16);
    buf[0] = 109; // 'm' correct, rest wrong
    expect(() => decodeMozLz4(buf)).toThrow("Not a mozlz4 file");
  });

  it("decodes empty payload", () => {
    const decoded = decodeMozLz4(encodeMozLz4(new Uint8Array(0)));
    expect(decoded.length).toBe(0);
    expect(decoded).toBeInstanceOf(Uint8Array);
  });

  it("decodes a short ascii string", () => {
    const original = new TextEncoder().encode("hello mozlz4");
    const decoded = decodeMozLz4(encodeMozLz4(original));
    expect(decoded).toEqual(original);
  });

  it("decodes literal-only blocks (no matches, too short for LZ4 matches)", () => {
    const buf = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(decodeMozLz4(encodeMozLz4(buf))).toEqual(buf);
  });

  it("handles extra literal length encoding (litLen >= 15)", () => {
    // 20 unique bytes guarantee no match found → litLen=20 requires extra length byte in token
    const buf = Uint8Array.from({ length: 20 }, (_, i) => i + 1);
    expect(decodeMozLz4(encodeMozLz4(buf))).toEqual(buf);
  });

  it("handles extra match length encoding (matchLen >= 19)", () => {
    // 4 unique prefix bytes then a 24-byte run repeated → matchLen=24, ml=20 needs extra bytes
    const prefix = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const repeat = new Uint8Array(24).fill(0xaa);
    const input = new Uint8Array([...prefix, ...repeat, ...repeat]);
    expect(decodeMozLz4(encodeMozLz4(input))).toEqual(input);
  });

  it("output is always a Uint8Array", () => {
    expect(decodeMozLz4(encodeMozLz4(new Uint8Array([0xff])))).toBeInstanceOf(Uint8Array);
  });

  it("throws when buffer is too short (< 12 bytes)", () => {
    expect(() => decodeMozLz4(new Uint8Array(11))).toThrow("Not a mozlz4 file");
  });

  it("throws on size mismatch (tampered size field)", () => {
    // Inflate the declared size so written < size → decompression mismatch
    const original = new Uint8Array([1, 2, 3, 4, 5]);
    const encoded = encodeMozLz4(original);
    const tampered = encoded.slice();
    new DataView(tampered.buffer).setUint32(8, 10, true); // claim 10 bytes, only 5 decode
    expect(() => decodeMozLz4(tampered)).toThrow("Not a mozlz4 file");
  });

  it("throws instead of allocating when the declared size exceeds the safety cap", () => {
    // A corrupted/truncated file could have any 4 bytes here — must reject
    // before `new Uint8Array(size)` ever runs, not after attempting it.
    const original = new Uint8Array([1, 2, 3, 4, 5]);
    const encoded = encodeMozLz4(original);
    const tampered = encoded.slice();
    new DataView(tampered.buffer).setUint32(8, 0xffffffff, true);
    expect(() => decodeMozLz4(tampered)).toThrow("Not a mozlz4 file");
  });

  it("decodes when input has non-zero byteOffset (subarray of a larger buffer)", () => {
    // Validates data.byteOffset + MAGIC.length in the DataView constructor
    const original = new TextEncoder().encode("hello mozlz4 byteOffset test");
    const encoded = encodeMozLz4(original);
    const padded = new Uint8Array(4 + encoded.length);
    padded.set(encoded, 4);
    const slice = padded.subarray(4); // byteOffset=4, same underlying ArrayBuffer
    expect(decodeMozLz4(slice)).toEqual(original);
  });

  it("decodes a pre-encoded fixture (Firefox sessionstore structure)", () => {
    // Binary fixture generated from a realistic 3-tab sessionstore JSON.
    // Validates decoder against a committed binary rather than always round-tripping
    // through our own encoder.
    const fixture = new Uint8Array(
      readFileSync(new URL("./fixtures/sessionstore.jsonlz4", import.meta.url)),
    );
    const decoded = decodeMozLz4(fixture);
    const parsed = JSON.parse(new TextDecoder().decode(decoded)) as {
      windows: [{ tabs: { entries: { url: string }[] }[] }];
    };
    expect(parsed.windows[0].tabs).toHaveLength(3);
    expect(parsed.windows[0].tabs[0].entries[0].url).toBe("https://example.com");
    expect(parsed.windows[0].tabs[1].entries[0].url).toBe("https://github.com");
    expect(parsed.windows[0].tabs[2].entries[0].url).toBe("https://www.npmjs.com/package/mozlz4");
  });
});

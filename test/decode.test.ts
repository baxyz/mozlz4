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

  it("returns subarray when written < declared size (tampered size field)", () => {
    // Inflate the declared size so `written < size` and the ternary's true branch fires
    const original = new Uint8Array([1, 2, 3, 4, 5]);
    const encoded = encodeMozLz4(original);
    const tampered = encoded.slice();
    new DataView(tampered.buffer).setUint32(8, 10, true); // claim 10 bytes, only 5 decode
    const decoded = decodeMozLz4(tampered);
    expect(decoded).toEqual(original);
  });
});

import { describe, it, expect } from "vitest";
import { encodeMozLz4 } from "../src/index";

const MAGIC = new Uint8Array([109, 111, 122, 76, 122, 52, 48, 0]); // "mozLz40\0"

describe("encodeMozLz4", () => {
  it("output starts with mozLz40\\0 magic", () => {
    expect(encodeMozLz4(new Uint8Array([1, 2, 3])).subarray(0, 8)).toEqual(MAGIC);
  });

  it("header stores uncompressed size as uint32 little-endian", () => {
    const input = new Uint8Array(100).fill(0x42);
    const result = encodeMozLz4(input);
    expect(new DataView(result.buffer).getUint32(8, true)).toBe(100);
  });

  it("empty input encodes to header + minimal block", () => {
    const result = encodeMozLz4(new Uint8Array(0));
    expect(result.length).toBeGreaterThanOrEqual(12);
    expect(new DataView(result.buffer).getUint32(8, true)).toBe(0);
  });

  it("repetitive data compresses to significantly smaller output", () => {
    const input = new Uint8Array(1000).fill(0xcc);
    const result = encodeMozLz4(input);
    // Should compress to well under 50 bytes (header=12 + tiny block)
    expect(result.length).toBeLessThan(50);
  });

  it("output is a Uint8Array", () => {
    expect(encodeMozLz4(new Uint8Array([0, 1, 2]))).toBeInstanceOf(Uint8Array);
  });

  it("encodes large input without exceeding output buffer", () => {
    const input = new Uint8Array(65536);
    for (let i = 0; i < input.length; i++) input[i] = (i * 37 + 13) & 0xff;
    const result = encodeMozLz4(input);
    expect(result.length).toBeGreaterThan(12);
    expect(new DataView(result.buffer).getUint32(8, true)).toBe(65536);
  });

  it("single byte input", () => {
    const result = encodeMozLz4(new Uint8Array([0x42]));
    expect(result.subarray(0, 8)).toEqual(MAGIC);
    expect(new DataView(result.buffer).getUint32(8, true)).toBe(1);
  });
});

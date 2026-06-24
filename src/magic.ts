// "mozLz40\0" — 8-byte header identifying Mozilla's LZ4 variant
export const MAGIC = new Uint8Array([109, 111, 122, 76, 122, 52, 48, 0]);
export const MAGIC_SIZE = 8;
export const SIZE_FIELD_SIZE = 4;
export const HEADER_SIZE = MAGIC_SIZE + SIZE_FIELD_SIZE;

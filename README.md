# mozlz4

[![npm](https://img.shields.io/npm/v/mozlz4)](https://www.npmjs.com/package/mozlz4)
[![CI](https://github.com/baxyz/mozlz4/actions/workflows/ci.yml/badge.svg)](https://github.com/baxyz/mozlz4/actions/workflows/ci.yml)
![coverage: 100%](https://img.shields.io/badge/coverage-100%25-brightgreen)
[![license: LGPL-3.0-or-later](https://img.shields.io/badge/license-LGPL--3.0--or--later-blue)](LICENSE)

Encode and decode Mozilla's **`mozLz40`** format — the LZ4-compressed binary format used by Firefox, Zen Browser, and other Mozilla-based browsers for profile files such as `sessionstore.jsonlz4`, `zen-sessions.jsonlz4`, `bookmarks.jsonlz4`, and other `.jsonlz4` / `.mozlz4` files.

## Features

- **Decode** mozlz4 files → `Uint8Array`
- **Encode** `Uint8Array` → mozlz4 files
- **Zero dependencies**
- Works in **Node.js, browsers, Deno, Bun, and GNOME GJS**
- **TypeScript-first** with full type declarations
- **Dual ESM + CJS** build targeting ESNext

## Install

```sh
npm install mozlz4
# or
pnpm add mozlz4
# or
yarn add mozlz4
```

## Usage

```ts
import { decodeMozLz4, encodeMozLz4 } from 'mozlz4'
import { readFileSync, writeFileSync } from 'node:fs'

// Decode a Firefox session file
const compressed = new Uint8Array(readFileSync('sessionstore.jsonlz4'))
const json = new TextDecoder().decode(decodeMozLz4(compressed))
console.log(JSON.parse(json))

// Re-encode modified data
const modified = JSON.stringify({ ...JSON.parse(json), version: 2 })
writeFileSync('sessionstore.jsonlz4', encodeMozLz4(new TextEncoder().encode(modified)))
```

## API

### `decodeMozLz4(data: Uint8Array): Uint8Array`

Decodes a mozlz4-encoded buffer and returns the raw uncompressed bytes.

Throws `Error('Not a mozlz4 file')` if the buffer is too short, the `mozLz40\0` magic header is absent, the declared decompressed size exceeds 1 GiB, or the decompressed size doesn't match the header.

### `encodeMozLz4(data: Uint8Array): Uint8Array`

Encodes a raw buffer using the mozlz4 format: `mozLz40\0` magic + uint32LE size + LZ4 block data.

## File format

| Offset | Size | Content |
| ------ | ---- | ------- |
| 0 | 8 | Magic: `mozLz40\0` (bytes `6d 6f 7a 4c 7a 34 30 00`) |
| 8 | 4 | Uncompressed size (uint32, little-endian) |
| 12 | n | LZ4 block-compressed data |

## Common Firefox files

| File | Description |
| ---- | ----------- |
| `sessionstore.jsonlz4` | Open tabs and windows |
| `bookmarks.jsonlz4` | Bookmark backups |
| `zen-sessions.jsonlz4` | Zen Browser workspaces |
| `*.mozlz4` | Various profile data |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[LGPL-3.0-or-later](LICENSE) © [baxyz](https://github.com/baxyz)

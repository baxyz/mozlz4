# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.4] — 2026-07-19

### Changed

- The published npm package now includes `CHANGELOG.md` alongside `LICENSE` and `README.md`

## [0.2.3] — 2026-07-19

### Fixed

- `decodeMozLz4` now rejects a decoded size that doesn't exactly match the declared size (was only checking for undersized output), and wraps internal LZ4 block-decoding failures in a clean `"Not a mozlz4 file"` error instead of letting a raw `RangeError` leak out on corrupted input

## [0.2.2] — 2026-07-08

### Fixed

- `decodeMozLz4` now rejects a declared decompressed size over 1 GiB before allocating, instead of trusting the untrusted 4-byte size field straight from the file

## [0.2.1] — 2026-06-28

### Changed

- Internal build tooling only: migrated the pack script from `pack.ts` to `pack.mjs`, dropped `tsx`, removed `DOM` from the tsconfig `lib`, and fixed the forbidden-fields check for `dist/package.json`

## [0.2.0] — 2026-06-27

### Changed

- Bump version to 0.2.0 to validate the release workflow end-to-end

## [0.1.0] — 2026-06-24

### Added

- `decodeMozLz4(data: Uint8Array): Uint8Array` — decode mozlz4 files
- `encodeMozLz4(data: Uint8Array): Uint8Array` — encode to mozlz4 format
- Dual ESM + CJS build with TypeScript declarations
- 100% code coverage

[unreleased]: https://github.com/baxyz/mozlz4/compare/v0.2.4...HEAD
[0.2.4]: https://github.com/baxyz/mozlz4/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/baxyz/mozlz4/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/baxyz/mozlz4/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/baxyz/mozlz4/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/baxyz/mozlz4/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/baxyz/mozlz4/releases/tag/v0.1.0

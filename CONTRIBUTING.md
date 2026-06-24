# Contributing to mozlz4

Thank you for taking the time to contribute! This document covers everything you need to get started.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Reporting bugs

Open a [bug report](https://github.com/baxyz/mozlz4/issues/new?template=bug_report.yml). Include a minimal reproduction and the exact mozlz4 version.

## Suggesting features

Open a [feature request](https://github.com/baxyz/mozlz4/issues/new?template=feature_request.yml). Explain the use case — what problem does it solve?

## Development setup

**Prerequisites:** Node.js ≥ 18, [pnpm](https://pnpm.io) ≥ 9.

```sh
git clone https://github.com/baxyz/mozlz4.git
cd mozlz4
pnpm install
```

### Available commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Compile to `dist/` (ESM + CJS + types) |
| `pnpm test` | Run tests with 100% coverage enforcement |
| `pnpm test:watch` | Watch mode |
| `pnpm typecheck` | TypeScript type check (no emit) |
| `pnpm lint` | Lint with oxlint |
| `pnpm format` | Format with oxfmt |
| `pnpm format:check` | Check formatting (used in CI) |

### Project structure

```
src/
  magic.ts      — MAGIC constant and header offsets
  decode.ts     — decodeMozLz4 + LZ4 block decoder
  encode.ts     — encodeMozLz4 + LZ4 block encoder
  index.ts      — public re-exports
test/
  decode.test.ts
  encode.test.ts
  roundtrip.test.ts
```

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Make your changes.
3. Ensure all checks pass: `pnpm test && pnpm typecheck && pnpm lint && pnpm format:check`.
4. 100% code coverage is enforced — add tests for every new branch.
5. Update `CHANGELOG.md` under `## [Unreleased]` if the change is user-visible.
6. Open a PR against `main` and fill in the template.

## Releasing (maintainers)

1. Update `CHANGELOG.md`: move `## [Unreleased]` entries to a new `## [x.y.z] — YYYY-MM-DD` section.
2. Bump `"version"` in `package.json`.
3. Commit: `git commit -m "chore: release vx.y.z"`.
4. Tag: `git tag vx.y.z && git push --follow-tags`.
5. The [Release workflow](.github/workflows/release.yml) publishes to npm automatically.

> **Note:** `NPM_TOKEN` must be set as a repository secret for publishing to work.

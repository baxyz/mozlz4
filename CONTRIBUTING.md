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

Run *Actions → Release → Run workflow* on `main` (tick `dry-run` first if in doubt). After the
checks of [CI](.github/workflows/ci.yml), [helpers4/action-release](https://github.com/helpers4/action-release)
computes the version from the Conventional Commits (`bump`: `auto`, or a forced level), writes it in
`package.json` and `jsr.json`, adds the section of the version to `CHANGELOG.md`, builds, dry-runs
the npm and JSR publications, pushes the signed release commit to `main`, tags it, publishes to npm
and JSR with trusted publishing (no token) and publishes the GitHub release.

- Do not bump `version` or push a `v*` tag by hand.
- A summary written under `## [Unreleased]` in `CHANGELOG.md` leads the section of the version and
  the release notes, above the list generated from the commits.
- If a registry step fails after the tag exists, fix the cause and *Re-run failed jobs* (or run
  **Release** with `bump: resume`). Never delete the tag.
- `release.yml` must keep its file name: the npm and JSR trusted publishers check it.
- npm publishes the `dist/` folder (`publishConfig.directory`); JSR publishes `src/` (`jsr.json`).

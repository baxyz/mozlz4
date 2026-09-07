# AGENTS.md — baxyz `mozlz4`

This repository inherits the [canonical workspace rules](https://github.com/baxyz/.dev/blob/main/AGENTS.md). Only project-specific details are documented here.

## Scope

Zero-dependency encode/decode library for Mozilla's `mozLz40` format, published to npm as
[`mozlz4`](https://www.npmjs.com/package/mozlz4).

## License

**LGPL-3.0-or-later** — a deliberate exception to the workspace's AGPL-3.0-only default, since
this is a small library meant to be freely imported/embedded by other projects (including
proprietary ones), not a standalone application.

## Commit Scopes

Defined in `scopes.json`: `core`, `build`, `test`, `bench`, `docs`, `deps`, `ci`.

## Structure

```text
mozlz4/
  src/          ← encode.ts, decode.ts, magic.ts, index.ts
  test/
  bench/        ← vitest bench (encode-decode.bench.ts)
  scripts/      ← pack.mjs (build post-processing)
```

## Commands

```bash
pnpm build           # vite build + type declarations + pack.mjs
pnpm typecheck
pnpm lint             # oxlint src test bench
pnpm format:check     # oxfmt --check src test bench
pnpm test             # vitest run --coverage
pnpm bench            # vitest bench
```

## Rules

- Zero runtime dependencies — this is a design constraint, not a preference. Do not add one
  without discussing it first.
- Keep dual ESM + CJS output working; `pnpm build` is the only supported way to produce `dist/`.

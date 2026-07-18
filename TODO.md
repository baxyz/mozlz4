# TODO

## decode.ts — guard against invalid match offsets in LZ4 decoding

**Priority:** Low

In `lz4BlockDecode` ([src/decode.ts](src/decode.ts)), the match-copy loop
doesn't validate `offset`:

```ts
let pos = d - offset;
for (let i = 0; i < matchLen; i++) dst[d++] = dst[pos++];
```

If `offset > d` (corrupted stream), `pos` goes negative: out-of-bounds
writes on the `Uint8Array` are silently ignored (no crash, no memory
corruption — JS is memory-safe), but the decoded output can be wrong
without any error being raised.

Worth evaluating against actual usage: if mozlz4 only decodes trusted files
(local Firefox/Zen sessions), the benefit is marginal. If it ends up parsing
files from an untrusted source, add an explicit check before the loop:

```ts
if (offset > d) throw new Error("Not a mozlz4 file");
```

and throw the same error to avoid a silently corrupted output.

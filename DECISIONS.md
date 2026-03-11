# `@asd14/eslint-plugin` decisions

This file contains details about why certain package decisions were taken.

**Important**:

- Decisions are immutable. If a decision needs to be changed or reversed, create
  a new decision entry that references the original. Do not edit existing
  decisions.
- Keep it lapidary, don't write deep-dives, if you need more space, redirect to
  a docs entry

<!-- vim-markdown-toc GFM -->

- [001: `c8` over Node's built-in test runner](#001-c8-over-nodes-built-in-test-runner)

<!-- vim-markdown-toc -->

## 001: `c8` over Node's built-in test runner

- **Date**: 11 March, 2026
- **Author**: Andrei Dumitrescu

**Problem**: Node's native test runner `--experimental-test-coverage` doesn't
properly handle source maps from transpilers (tsx, swc).

```sh
node --import tsx \
  --test --experimental-test-coverage --enable-source-maps \
  --test-coverage-exclude 'src/**/*.test.ts' \
  'src/**/*.test.ts'
```

- Without `--enable-source-maps`, branch coverage reports lines from the
  transpiled output instead of the original TS source
- With `--enable-source-maps`, branches are accurate but line reports include
  phantom uncovered lines (import/export types, JSDoc)
- Either way, if coverage is under 100% the uncovered line numbers are mangled
  and unhelpful, making debugging impossible

**Solution**: Use [`c8`](https://github.com/bcoe/c8) instead. Reported uncovered
lines map back to the actual TS source.

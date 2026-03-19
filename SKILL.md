---
name: using-asd14-eslint-plugin
description:
  Enforces consistent formats in throw arguments and function call arguments via
  ESLint. Use when configuring @asd14/eslint-plugin or adding format linting
  rules.
---

# @asd14/eslint-plugin

ESLint rules for opinionated DX patterns not covered by existing plugins.
Requires `eslint ^9 || ^10` as peer dependency. See [README.md](README.md) for
install instructions.

## Shared config shape

All rules share the same option structure. Each key is a `|`-separated list of
names; the value is an entry with an optional `mode` and a `checks` array:

```js
"TypeError|RangeError": {
  mode: "or",   // "or" (default) | "and"
  checks: [{ argumentIndex?, pattern?, message }]
}
```

- **Across options** - always AND: every entry whose key matches must pass
- **Within an entry** - controlled by `mode`:
  - `"or"`: first matching check = pass
  - `"and"`: every check must match
- **Check without `pattern`** - existence check

## Rules

- [`@asd14/throw-argument-format`](src/rules/throw-argument-format/README.md) —
  enforce consistent error message format in `throw` statements
- [`@asd14/call-argument-format`](src/rules/call-argument-format/README.md) —
  enforce consistent argument format in function or method calls

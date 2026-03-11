[![npm version](https://badge.fury.io/js/%40asd14%2Feslint-plugin.svg)](https://badge.fury.io/js/%40asd14%2Feslint-plugin)
![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)

# @asd14/eslint-plugin

> ESLint rules for opinionated DX not covered by existing plugins.

<!-- vim-markdown-toc GFM -->

- [Install](#install)
- [Rules](#rules)
  - [`@asd14/error-message-format`](#asd14error-message-format)
- [Develop](#develop)

<!-- vim-markdown-toc -->

## Install

```bash
npm install @asd14/eslint-plugin --save-dev
```

> NOTE: requires peerDependency `eslint^9` or `eslint^10`

## Rules

### `@asd14/error-message-format`

Enforce consistent error message format in `throw` statements.

- Per error class: `Error`, `TypeError` or custom `DBError`
- Each is an array of `RegExp` patterns
- `OR` matching, first match wins

```js
// eslint.config.js
import asd14Plugin from "@asd14/eslint-plugin"

export default [
  {
    plugins: { "@asd14": asd14Plugin },
    rules: {
      "@asd14/error-message-format": [
        "error",
        {
          TypeError: [
            {
              pattern:
                "^@asd14/m/\\w+: expected '\\w+' to be '\\w+' or '\\w+', got '\\w+'",
              message:
                "Format: @asd14/m/<fn>: expected '<param>' to be '<Type>' or '<Type>', got '<Actual>'"
            },
            {
              pattern:
                "^@asd14/m/\\w+: expected '\\w+' to be '\\w+', got '\\w+'",
              message:
                "Format: @asd14/m/<fn>: expected '<param>' to be '<Type>', got '<Actual>'"
            }
          ]
        }
      ]
    }
  }
]
```

Examples of **correct** messages:

```js
// Template literal with interpolation
throw new TypeError(
  `@asd14/m/sort: expected 'input' to be 'Array', got '${type(input)}'`
)

// String concatenation
throw new TypeError(
  "@asd14/m/sort: expected 'input' to be 'Array', got '" + type(input) + "'"
)

// "or" variant - multiple expected types
throw new TypeError(
  `@asd14/m/all: expected 'fn' to be 'Function' or 'Array', got '${type(fn)}'`
)

// Unconfigured error classes are ignored
throw new Error("something went wrong")
```

Examples of **incorrect** messages:

```js
// Missing @asd14/m/ prefix
throw new TypeError("expected 'input' to be 'Array', got '" + type(x) + "'")

// Unquoted types
throw new TypeError(`@asd14/m/sort: expected Array, got ${type(input)}`)

// Can't statically evaluate
throw new TypeError(message)
```

## Develop

```bash
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run test        # node:test runner
npm run coverage    # c8 --100
```

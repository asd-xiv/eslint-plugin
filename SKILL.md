---
name: using-asd14-eslint-plugin
description:
  Enforces consistent error message formats in throw statements via ESLint. Use
  when configuring @asd14/eslint-plugin or adding error-message linting rules.
---

# @asd14/eslint-plugin

ESLint rules for opinionated DX patterns not covered by existing plugins.
Requires `eslint ^9 || ^10` as peer dependency.

## error-message-format

Enforce consistent error message format in `throw` statements.

- Per error class: `Error`, `TypeError` or custom `DBError`
- Each class is an array of `RegExp` patterns
- `OR` matching, first match wins
- Supports string literals, template literals, and string concatenation
- Variables or function calls as the sole argument are flagged as non-evaluable

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
              pattern: "^myLib/\\w+: expected '\\w+' to be '\\w+', got '\\w+'",
              message:
                "Format: myLib/<fn>: expected '<param>' to be '<Type>', got '<Actual>'"
            }
          ]
        }
      ]
    }
  }
]
```

### Correct

```js
// String literal
throw new TypeError("myLib/sort: expected 'input' to be 'Array', got 'Number'")

// Template literal with interpolation
throw new TypeError(
  `myLib/sort: expected 'input' to be 'Array', got '${type(input)}'`
)

// String concatenation
throw new TypeError(
  "myLib/sort: expected 'input' to be 'Array', got '" + type(input) + "'"
)

// Unconfigured error classes are ignored
throw new Error("anything goes")
```

### Incorrect

```js
// Missing prefix
throw new TypeError("expected 'input' to be 'Array', got 'Number'")

// Unquoted types
throw new TypeError(`myLib/sort: expected Array, got ${type(input)}`)

// Non-evaluable — variable reference
throw new TypeError(message)
```

## Contributing rules

- Each rule in its own folder: `src/rules/<rule-name>/`
- Export from `src/index.ts`
- Tests: `node:test` + `RuleTester`, split into valid/invalid groups
- 100% coverage enforced via `c8 --100`

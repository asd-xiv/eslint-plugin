# `@asd14/throw-argument-format`

Enforce error message format in `throw` statements.

**Entry options** (per `|`-separated key):

| Option   | Type            | Default | Description                                                   |
| -------- | --------------- | ------- | ------------------------------------------------------------- |
| `mode`   | `"or" \| "and"` | `"or"`  | `or`: any check matching = pass. `and`: all checks must match |
| `checks` | `Check[]`       | -       | List of checks to run                                         |

**Check options:**

| Option          | Type      | Default | Description                                                                   |
| --------------- | --------- | ------- | ----------------------------------------------------------------------------- |
| `argumentIndex` | `integer` | `0`     | Argument position; negative counts from end (`-1` = last)                     |
| `pattern`       | `string`  | -       | Regexp tested against the stringified argument; omit to assert existence only |
| `message`       | `string`  | -       | Error message shown on violation                                              |

- Multiple options for the same class are AND'd (all must pass)
- Arguments can be string literals, template literals, and string concatenation
- Variables or function calls as the argument are flagged as non-evaluable

```js
// eslint.config.js
import asd14Plugin from "@asd14/eslint-plugin"

export default [
  {
    plugins: { "@asd14": asd14Plugin },
    rules: {
      "@asd14/throw-argument-format": [
        "error",
        {
          // Shared namespace - both classes must satisfy this entry
          "TypeError|RangeError": {
            checks: [
              {
                pattern: "^@asd14/m/\\w+: ",
                message: "Must use @asd14/m namespace"
              }
            ]
          },
          // Body format specific to TypeError - single-type or two-type variant
          "TypeError": {
            mode: "or",
            checks: [
              {
                pattern:
                  "^@asd14/m/\\w+: expected '\\w+' to be '\\w+', got '\\w+'",
                message:
                  "Format: @asd14/m/<fn>: expected '<param>' to be '<Type>', got '<Actual>'"
              },
              {
                pattern:
                  "^@asd14/m/\\w+: expected '\\w+' to be '\\w+' or '\\w+', got '\\w+'",
                message:
                  "Format: @asd14/m/<fn>: expected '<param>' to be '<Type>' or '<Type>', got '<Actual>'"
              }
            ]
          },
          // Body format specific to RangeError
          "RangeError": {
            checks: [
              {
                pattern:
                  "^@asd14/m/\\w+: index \\d+ out of bounds \\[\\d+, \\d+\\]",
                message:
                  "Format: @asd14/m/<fn>: index <n> out of bounds [<min>, <max>]"
              }
            ]
          }
        }
      ]
    }
  }
]
```

## Examples

**Correct**

```js
// TypeError satisfies namespace entry + type-error body entry
throw new TypeError(
  `@asd14/m/sort: expected 'input' to be 'Array', got '${type(input)}'`
)

// RangeError satisfies namespace entry + range body entry
throw new RangeError("@asd14/m/slice: index 5 out of bounds [0, 3]")

// Unconfigured class (ignored)
throw new Error("something went wrong")
```

**Incorrect**

```js
// Missing namespace
throw new TypeError("expected 'input' to be 'Array', got 'string'")

// Wrong body format
throw new RangeError("@asd14/m/sort: expected something")

// Can't statically evaluate
throw new TypeError(message)
```

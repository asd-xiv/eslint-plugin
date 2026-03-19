# `@asd14/call-argument-format`

ESLint rule to enforce argument format in function calls.

**Entry options** (per `|`-separated key):

| Option   | Type            | Default | Description                                                   |
| -------- | --------------- | ------- | ------------------------------------------------------------- |
| `mode`   | `"or" \| "and"` | `"or"`  | `or`: any check matching = pass. `and`: all checks must match |
| `checks` | `Check[]`       | —       | List of checks to run                                         |

**Check options:**

| Option          | Type      | Default | Description                                                                   |
| --------------- | --------- | ------- | ----------------------------------------------------------------------------- |
| `argumentIndex` | `integer` | `0`     | Argument position; negative counts from end (`-1` = last)                     |
| `pattern`       | `string`  | —       | Regexp tested against the stringified argument; omit to assert existence only |
| `message`       | `string`  | —       | Error message shown on violation                                              |

- Multiple options for the same name are AND'd (all must pass)
- Supports direct calls (`test(...)`) and method calls (`t.equal(...)`,
  `expect().toRaiseError(...)`)
- Arguments can be string literals, template literals, and string concatenation
- Variables or function calls as the argument are flagged as non-evaluable

```js
// eslint.config.js
import asd14Plugin from "@asd14/eslint-plugin"

export default [
  {
    plugins: { "@asd14": asd14Plugin },
    rules: {
      "@asd14/call-argument-format": [
        "error",
        {
          // Tape assertion messages must follow given/should pattern
          "equal|deepEqual|ok|throws": {
            checks: [
              {
                argumentIndex: -1,
                pattern: "^given \\[.+\\] should \\[.+\\]$",
                message:
                  "Assertion message must match: given [<context>] should [<expectation>]"
              }
            ]
          },
          // toRaiseError must have an argument (no pattern = existence check)
          "toRaiseError": {
            checks: [
              {
                message: "toRaiseError() must include an error pattern argument"
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
t.equal(result, 42, "given [valid input] should [return 42]")

expect(mutate({ name: 42 }, input)).type.toRaiseError(
  /'number' is not assignable/
)
```

**Incorrect**

```js
// Wrong format
t.equal(result, 42, "returns 42")

// Missing argument
expect(mutate({ name: 42 }, input)).type.toRaiseError()

// Can't statically evaluate
t.equal(result, 42, message)
```

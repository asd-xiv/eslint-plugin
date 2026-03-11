---
name: using-asd14-eslint-plugin
description:
  Enforces consistent formats in throw arguments and function call arguments via
  ESLint. Use when configuring @asd14/eslint-plugin or adding format linting
  rules.
---

# @asd14/eslint-plugin

ESLint rules for opinionated DX patterns not covered by existing plugins.
Requires `eslint ^9 || ^10` as peer dependency.

## throw-argument-format

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
      "@asd14/throw-argument-format": [
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
throw new TypeError("myLib/sort: expected 'input' to be 'Array', got 'Number'")
throw new TypeError(
  `myLib/sort: expected 'input' to be 'Array', got '${type(input)}'`
)
throw new TypeError(
  "myLib/sort: expected 'input' to be 'Array', got '" + type(input) + "'"
)
throw new Error("anything goes")
```

### Incorrect

```js
throw new TypeError("expected 'input' to be 'Array', got 'Number'")
throw new TypeError(`myLib/sort: expected Array, got ${type(input)}`)
throw new TypeError(message)
```

## call-argument-format

Enforce consistent argument format in function or method calls.

- Key: `|`-separated function/method names
- `argumentIndex`: defaults to `0`, negative counts from end (`-1` = last arg)
- `pattern`: regexp tested against the stringified argument
- `required: true`: asserts the argument exists (no regexp needed)
- Works with direct calls (`test(...)`) and method calls (`t.equal(...)`,
  `expect().toRaiseError(...)`)

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
          "equal|deepEqual|ok|throws": [
            {
              argumentIndex: -1,
              pattern: "^given \\[.+\\] should \\[.+\\]$",
              message:
                "Assertion message must match: given [<context>] should [<expectation>]"
            }
          ],
          "toRaiseError": [
            {
              required: true,
              message: "toRaiseError() must include an error pattern argument"
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
t.equal(result, 42, "given [valid input] should [return 42]")
expect(mutate({ name: 42 }, input)).type.toRaiseError(
  /'number' is not assignable/
)
```

### Incorrect

```js
t.equal(result, 42, "returns 42")
expect(mutate({ name: 42 }, input)).type.toRaiseError()
```

## Contributing rules

- Each rule in its own folder: `src/rules/<rule-name>/`
- Export from `src/index.ts`
- Tests: `node:test` + `RuleTester`, split into valid/invalid groups
- 100% coverage enforced via `c8 --100`

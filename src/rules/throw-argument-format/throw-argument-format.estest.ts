import { RuleTester } from "eslint"

import { throwArgumentFormat } from "./throw-argument-format.js"

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
})

// Mirrors the config in @asd14/m's eslint.config.js
const OPTIONS = [
  {
    TypeError: [
      {
        pattern:
          "^@asd14/m/\\w+: expected '\\w+' to be '\\w+' or '\\w+', got '\\w+'",
        message:
          "Format: @asd14/m/<fn>: expected '<param>' to be '<Type>' or '<Type>', got '<Actual>'",
      },
      {
        pattern: "^@asd14/m/\\w+: expected '\\w+' to be '\\w+', got '\\w+'",
        message:
          "Format: @asd14/m/<fn>: expected '<param>' to be '<Type>', got '<Actual>'",
      },
    ],
  },
]

ruleTester.run("throw-argument-format", throwArgumentFormat, {
  valid: [
    // Single type — interpolated actual via template literal
    {
      code: "throw new TypeError(`@asd14/m/sort: expected 'input' to be 'Array', got '${type(input)}'`)",
      options: OPTIONS,
    },
    // "or" variant — two expected types, interpolated actual
    {
      code: "throw new TypeError(`@asd14/m/all: expected 'fn' to be 'Function' or 'Array', got '${type(fn)}'`)",
      options: OPTIONS,
    },
    // String concatenation
    {
      code: "throw new TypeError(\"@asd14/m/sort: expected 'input' to be 'Array', got '\" + type(input) + \"'\")",
      options: OPTIONS,
    },
    // Non-TypeError throws are ignored
    {
      code: 'throw new Error("something went wrong")',
      options: OPTIONS,
    },
    // throw without new expression is ignored
    {
      code: 'throw "some string"',
      options: OPTIONS,
    },
    // No arguments — `new TypeError()` is silently skipped
    {
      code: "throw new TypeError()",
      options: OPTIONS,
    },
    // No options = rule is a no-op
    {
      code: 'throw new TypeError("whatever")',
    },
    // Empty checks array — error class registered but no patterns
    {
      code: 'throw new TypeError("whatever")',
      options: [{ TypeError: [] }],
    },
    // Computed callee — `new errors["TypeError"]()` is not checked
    {
      code: 'throw new errors["TypeError"]("whatever")',
      options: OPTIONS,
    },
  ],
  invalid: [
    // Missing @asd14/m/ prefix
    {
      code: "throw new TypeError(\"expected 'input' to be 'Array', got '\" + type(x) + \"'\")",
      options: OPTIONS,
      errors: [{ messageId: "formatViolation" }],
    },
    // Old style — no quoted types
    {
      code: "throw new TypeError(`@asd14/m/sort: expected Array, got ${type(input)}`)",
      options: OPTIONS,
      errors: [{ messageId: "formatViolation" }],
    },
    // Old style — double quotes for param name
    {
      code: 'throw new TypeError(`@asd14/m/splitInGroupsOf: expected positive integer for "size", got ${JSON.stringify(size)}`)',
      options: OPTIONS,
      errors: [{ messageId: "formatViolation" }],
    },
    // Old style — missing param name, no "to be"
    {
      code: "throw new TypeError(`@asd14/m/sort: expected 'Array', got '${type(input)}'`)",
      options: OPTIONS,
      errors: [{ messageId: "formatViolation" }],
    },
    // Empty string — evaluable but doesn't match any pattern
    {
      code: 'throw new TypeError("")',
      options: OPTIONS,
      errors: [{ messageId: "formatViolation" }],
    },
    // Variable reference — can't statically evaluate
    {
      code: "throw new TypeError(message)",
      options: OPTIONS,
      errors: [{ messageId: "cannotEvaluate" }],
    },
    // Function call — can't statically evaluate
    {
      code: "throw new TypeError(getMessage())",
      options: OPTIONS,
      errors: [{ messageId: "cannotEvaluate" }],
    },
  ],
})

// Test with Error class configured
const ERROR_OPTIONS = [
  {
    Error: [
      {
        pattern: "^\\[\\w+]",
        message: "Error must start with '[moduleName]'",
      },
    ],
  },
]

ruleTester.run("throw-argument-format (Error class)", throwArgumentFormat, {
  valid: [
    {
      code: 'throw new Error("[parser] unexpected token")',
      options: ERROR_OPTIONS,
    },
    // TypeError not configured, so ignored
    {
      code: 'throw new TypeError("no prefix needed")',
      options: ERROR_OPTIONS,
    },
  ],
  invalid: [
    {
      code: 'throw new Error("missing bracket prefix")',
      options: ERROR_OPTIONS,
      errors: [{ messageId: "formatViolation" }],
    },
  ],
})

console.log("All throw-argument-format tests passed")

import { RuleTester } from "eslint"

import { ensureThrowArgumentFormat } from "./throw-argument-format.js"

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
})

{
  const OPTIONS = [
    {
      TypeError: {
        mode: "or",
        checks: [
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
    },
  ]

  ruleTester.run("throw-argument-format", ensureThrowArgumentFormat, {
    valid: [
      // Success - OR picks the second check
      {
        code: "throw new TypeError(`@asd14/m/sort: expected 'input' to be 'Array', got '${type(input)}'`)",
        options: OPTIONS,
      },
      // Success - OR picks the first check
      {
        code: "throw new TypeError(`@asd14/m/all: expected 'fn' to be 'Function' or 'Array', got '${type(fn)}'`)",
        options: OPTIONS,
      },
      // Ignore - Unconfigured class
      { code: 'throw new Error("anything goes")', options: OPTIONS },
      // Ignore - Rule with no options is a no-op
      { code: 'throw new TypeError("whatever")' },
      // Ignore - Computed callee
      {
        code: 'throw new errors["TypeError"]("whatever")',
        options: OPTIONS,
      },
    ],
    invalid: [
      // Error - Configured class with no argument
      {
        code: "throw new TypeError()",
        options: OPTIONS,
        errors: [{ messageId: "missingArgument" }],
      },
      // Error - Missing namespace prefix
      {
        code: "throw new TypeError(\"expected 'input' to be 'Array', got '\" + type(x) + \"'\")",
        options: OPTIONS,
        errors: [{ messageId: "formatViolation" }],
      },
      // Error - No quoted types
      {
        code: "throw new TypeError(`@asd14/m/sort: expected Array, got ${type(input)}`)",
        options: OPTIONS,
        errors: [{ messageId: "formatViolation" }],
      },
      // Error - Non-literal, can't evaluate
      {
        code: "throw new TypeError(message)",
        options: OPTIONS,
        errors: [{ messageId: "cannotEvaluate" }],
      },
      // Error - Spread argument, can't evaluate
      {
        code: "throw new TypeError(...args)",
        options: OPTIONS,
        errors: [{ messageId: "cannotEvaluate" }],
      },
    ],
  })
}

// Existence check: no pattern = assert argument present
{
  const OPTIONS = [
    {
      CustomError: {
        checks: [{ message: "CustomError must have a message" }],
      },
    },
  ]

  ruleTester.run(
    "throw-argument-format (existence check)",
    ensureThrowArgumentFormat,
    {
      valid: [
        {
          code: 'throw new CustomError("something went wrong")',
          options: OPTIONS,
        },
      ],
      invalid: [
        {
          code: "throw new CustomError()",
          options: OPTIONS,
          errors: [{ messageId: "missingArgument" }],
        },
      ],
    }
  )
}

// AND mode: every check must pass
{
  const OPTIONS = [
    {
      Error: {
        mode: "and",
        checks: [
          {
            pattern: "^@asd14/",
            message: "Must start with '@asd14/' namespace",
          },
          {
            pattern: "^@asd14/\\w+: ",
            message: "Format: @asd14/<module>: <description>",
          },
        ],
      },
    },
  ]

  ruleTester.run(
    "throw-argument-format (AND mode)",
    ensureThrowArgumentFormat,
    {
      valid: [
        {
          code: 'throw new Error("@asd14/parser: unexpected token")',
          options: OPTIONS,
        },
      ],
      invalid: [
        // Error - Passes first check, fails second
        {
          code: 'throw new Error("@asd14/something wrong")',
          options: OPTIONS,
          errors: [{ message: "Format: @asd14/<module>: <description>" }],
        },
        // Error - Fails first check
        {
          code: 'throw new Error("something else")',
          options: OPTIONS,
          errors: [{ message: "Must start with '@asd14/' namespace" }],
        },
      ],
    }
  )
}

// Overlapping options: RangeError must satisfy both the shared namespace option
// AND its own body-format option (AND across options)
{
  const OPTIONS = [
    {
      "TypeError|RangeError": {
        checks: [
          {
            pattern: "^@asd14/m/\\w+: ",
            message: "Must use @asd14/m namespace prefix",
          },
        ],
      },
      "RangeError": {
        checks: [
          {
            pattern:
              "^@asd14/m/\\w+: index \\d+ out of bounds \\[\\d+, \\d+\\]",
            message:
              "Format: @asd14/m/<fn>: index <n> out of bounds [<min>, <max>]",
          },
        ],
      },
    },
  ]

  ruleTester.run(
    "throw-argument-format (overlapping options)",
    ensureThrowArgumentFormat,
    {
      valid: [
        // Success - TypeError only needs the shared namespace option
        {
          code: 'throw new TypeError("@asd14/m/sort: anything")',
          options: OPTIONS,
        },
        // Success - RangeError satisfies both options
        {
          code: 'throw new RangeError("@asd14/m/slice: index 5 out of bounds [0, 3]")',
          options: OPTIONS,
        },
      ],
      invalid: [
        // Error - RangeError passes namespace option but fails body option
        {
          code: 'throw new RangeError("@asd14/m/sort: expected something")',
          options: OPTIONS,
          errors: [{ messageId: "formatViolation" }],
        },
        // Error - RangeError fails both options
        {
          code: 'throw new RangeError("something went wrong")',
          options: OPTIONS,
          errors: [{ messageId: "formatViolation" }],
        },
        // Error - TypeError fails namespace option
        {
          code: 'throw new TypeError("index 5 out of bounds [0, 3]")',
          options: OPTIONS,
          errors: [{ messageId: "formatViolation" }],
        },
      ],
    }
  )
}

console.log("All throw-argument-format tests passed")

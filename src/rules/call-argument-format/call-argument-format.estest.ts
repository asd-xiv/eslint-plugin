import { RuleTester } from "eslint"

import { ensureCallArgumentFormat } from "./call-argument-format.js"

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
})

{
  const OPTIONS = [
    {
      "test|describe": {
        checks: [
          {
            pattern: "^given .+ should .+",
            message:
              "Test title must match: given <context> should <expectation>",
          },
        ],
      },
    },
  ]

  ruleTester.run("call-argument-format", ensureCallArgumentFormat, {
    valid: [
      // Success - Happy path
      {
        code: 'test("given somethig should another", () => {})',
        options: OPTIONS,
      },
      // Success - Template literal interpolated as "EXPR"
      { code: "test(`given ${x} should another`, () => {})", options: OPTIONS },
      // Ignore - Not configured function name
      { code: 'it("whatever title", () => {})', options: OPTIONS },
      // Ignore - No options passed to rule
      { code: 'test("whatever")' },
      // Ignore - Computed property
      { code: 'obj["test"]("whatever")', options: OPTIONS },
    ],
    invalid: [
      // Error - No check match
      {
        code: 'test("returns true for numbers", () => {})',
        options: OPTIONS,
        errors: [{ messageId: "formatViolation" }],
      },
      // Error - Non-literal, can't evaluate
      {
        code: "test(title, () => {})",
        options: OPTIONS,
        errors: [{ messageId: "cannotEvaluate" }],
      },
      // Error - Spread argument, can't evaluate
      {
        code: "test(...args)",
        options: OPTIONS,
        errors: [{ messageId: "cannotEvaluate" }],
      },
    ],
  })
}

{
  const OPTIONS = [
    {
      toRaiseError: {
        checks: [{ message: "toRaiseError must include an error pattern" }],
      },
    },
  ]

  ruleTester.run(
    "call-argument-format (existence check)",
    ensureCallArgumentFormat,
    {
      valid: [
        {
          code: "expect(x).toRaiseError(/some error/)",
          options: OPTIONS,
        },
      ],
      invalid: [
        {
          code: "expect(x).toRaiseError()",
          options: OPTIONS,
          errors: [{ messageId: "missingArgument" }],
        },
      ],
    }
  )
}

{
  const OPTIONS = [
    {
      equal: {
        checks: [
          {
            argumentIndex: -1,
            pattern: "^given .+",
            message: "Last arg must start with 'given'",
          },
        ],
      },
    },
  ]

  ruleTester.run(
    "call-argument-format (negative index)",
    ensureCallArgumentFormat,
    {
      valid: [
        {
          code: 't.equal(actual, expected, "given input should match")',
          options: OPTIONS,
        },
      ],
      invalid: [
        {
          code: 't.equal(actual, expected, "should match output")',
          options: OPTIONS,
          errors: [{ messageId: "formatViolation" }],
        },
      ],
    }
  )
}

{
  const OPTIONS = [
    {
      log: {
        mode: "or",
        checks: [
          { pattern: "^info: ", message: "..." },
          { pattern: "^warn: ", message: "..." },
        ],
      },
    },
  ]

  ruleTester.run("call-argument-format (OR mode)", ensureCallArgumentFormat, {
    valid: [
      {
        code: 'log("warn: something")',
        options: OPTIONS,
      },
    ],
    invalid: [
      // Error - neither rule matches
      {
        code: 'log("error: something")',
        options: OPTIONS,
        errors: [{ messageId: "formatViolation" }],
      },
    ],
  })
}

{
  const OPTIONS = [
    {
      log: {
        mode: "and",
        checks: [
          {
            pattern: "^\\[\\w+\\]",
            message: "Must start with '[module]' tag",
          },
          {
            pattern: "\\[\\w+\\] .{10,}",
            message: "Message body must be at least 10 chars",
          },
        ],
      },
    },
  ]

  ruleTester.run("call-argument-format (AND mode)", ensureCallArgumentFormat, {
    valid: [
      {
        code: 'log("[parser] unexpected end of input")',
        options: OPTIONS,
      },
    ],
    invalid: [
      // Error - Passes first check, fails second (body too short)
      {
        code: 'log("[parser] oops")',
        options: OPTIONS,
        errors: [{ message: "Message body must be at least 10 chars" }],
      },
      // Error - Fails first check
      {
        code: 'log("missing tag")',
        options: OPTIONS,
        errors: [{ message: "Must start with '[module]' tag" }],
      },
    ],
  })
}

console.log("All call-argument-format tests passed")

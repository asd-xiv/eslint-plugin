import { RuleTester } from "eslint"

import { callArgumentFormat } from "./call-argument-format.js"

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
})

// --- test/describe title format ---

const TEST_OPTIONS = [
  {
    "test|describe": [
      {
        pattern: "^given .+ should .+",
        message: "Test title must match: given <context> should <expectation>",
      },
    ],
  },
]

ruleTester.run("call-argument-format (test titles)", callArgumentFormat, {
  valid: [
    {
      code: 'test("given a number should return true", () => {})',
      options: TEST_OPTIONS,
    },
    {
      code: 'describe("given empty input should throw", () => {})',
      options: TEST_OPTIONS,
    },
    // Template literal with interpolation
    {
      code: "test(`given ${x} should return EXPR`, () => {})",
      options: TEST_OPTIONS,
    },
    // Unconfigured function — ignored
    {
      code: 'it("whatever title", () => {})',
      options: TEST_OPTIONS,
    },
    // No options — rule is a no-op
    {
      code: 'test("whatever")',
    },
  ],
  invalid: [
    // Missing "given ... should ..."
    {
      code: 'test("returns true for numbers", () => {})',
      options: TEST_OPTIONS,
      errors: [{ messageId: "formatViolation" }],
    },
    {
      code: 'describe("number validation", () => {})',
      options: TEST_OPTIONS,
      errors: [{ messageId: "formatViolation" }],
    },
  ],
})

// --- required argument (toRaiseError) ---

const REQUIRED_OPTIONS = [
  {
    toRaiseError: [
      {
        required: true,
        message: "toRaiseError must include an error pattern argument",
      },
    ],
  },
]

ruleTester.run("call-argument-format (required arg)", callArgumentFormat, {
  valid: [
    // Has an argument
    {
      code: "expect(x).toRaiseError(/some error/)",
      options: REQUIRED_OPTIONS,
    },
    {
      code: 'expect(x).toRaiseError("error message")',
      options: REQUIRED_OPTIONS,
    },
    // Unconfigured method — ignored
    {
      code: "expect(x).toBe()",
      options: REQUIRED_OPTIONS,
    },
  ],
  invalid: [
    // No argument
    {
      code: "expect(x).toRaiseError()",
      options: REQUIRED_OPTIONS,
      errors: [{ messageId: "missingArgument" }],
    },
  ],
})

// --- negative argumentIndex ---

const LAST_ARG_OPTIONS = [
  {
    "equal|deepEqual": [
      {
        argumentIndex: -1,
        pattern: "^given .+",
        message: "Last argument must start with 'given'",
      },
    ],
  },
]

ruleTester.run("call-argument-format (negative index)", callArgumentFormat, {
  valid: [
    {
      code: 't.equal(actual, expected, "given input should match")',
      options: LAST_ARG_OPTIONS,
    },
    {
      code: 't.deepEqual(a, b, "given empty array should equal")',
      options: LAST_ARG_OPTIONS,
    },
    // Only 1 arg, index -1 resolves to arg[0]
    {
      code: 't.equal("given something")',
      options: LAST_ARG_OPTIONS,
    },
  ],
  invalid: [
    {
      code: 't.equal(actual, expected, "should match output")',
      options: LAST_ARG_OPTIONS,
      errors: [{ messageId: "formatViolation" }],
    },
    {
      code: 't.deepEqual(a, b, "wrong format")',
      options: LAST_ARG_OPTIONS,
      errors: [{ messageId: "formatViolation" }],
    },
  ],
})

// --- method call on object (t.equal, expect().x) ---

ruleTester.run("call-argument-format (member expr)", callArgumentFormat, {
  valid: [
    // Computed property — ignored
    {
      code: 'obj["test"]("whatever")',
      options: TEST_OPTIONS,
    },
  ],
  invalid: [],
})

// --- check with only message (no pattern, no required) — no-op ---

ruleTester.run("call-argument-format (no-op check)", callArgumentFormat, {
  valid: [
    {
      code: 'test("anything goes")',
      options: [{ test: [{ message: "this check does nothing" }] }],
    },
  ],
  invalid: [],
})

// --- multiple checks on same key ---

const MULTI_CHECK_OPTIONS = [
  {
    test: [
      {
        required: true,
        message: "test() must have a title argument",
      },
      {
        pattern: "^given .+",
        message: "test title must start with 'given'",
      },
    ],
  },
]

ruleTester.run("call-argument-format (multi-check)", callArgumentFormat, {
  valid: [
    {
      code: 'test("given valid input", () => {})',
      options: MULTI_CHECK_OPTIONS,
    },
  ],
  invalid: [
    // No arguments — fails required check
    {
      code: "test()",
      options: MULTI_CHECK_OPTIONS,
      errors: [{ messageId: "missingArgument" }],
    },
    // Has argument but wrong format — fails pattern check
    {
      code: 'test("wrong format", () => {})',
      options: MULTI_CHECK_OPTIONS,
      errors: [{ messageId: "formatViolation" }],
    },
  ],
})

console.log("All call-argument-format tests passed")

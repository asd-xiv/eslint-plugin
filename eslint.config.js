import { tsConfig, devConfig, commonIgnores } from "@asd14/eslint-config/ts"
import asd14Plugin from "@asd14/eslint-plugin"

const SRC_FILES = ["src/**/*.ts"]
const TEST_FILES = ["src/**/*.test.ts"]
const ESTEST_FILES = ["src/**/*.estest.ts"]
const DEV_FILES = ["eslint.config.js"]

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: commonIgnores },
  {
    files: SRC_FILES,
    ...tsConfig,
  },
  {
    files: [...TEST_FILES, ...ESTEST_FILES, ...DEV_FILES],
    ...tsConfig,
    ...devConfig,
    rules: {
      ...tsConfig.rules,
      ...devConfig.rules,

      // `node:test` describe/test return promises that are handled by the test runner
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
  {
    files: [...TEST_FILES],
    plugins: { "@asd14": asd14Plugin },
    rules: {
      "@asd14/call-argument-format": [
        "error",
        {
          test: {
            checks: [
              {
                pattern: "^given \\[.+\\] should \\[.+\\]$",
                message:
                  "Assertion message must match: given [<context>] should [<expectation>]",
              },
            ],
          },
        },
      ],
    },
  },
]

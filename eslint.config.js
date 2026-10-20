import path from "node:path"
import { tsConfig, devConfig, getIgnorePatterns } from "@asd14/eslint-config/ts"

const SRC_FILES = ["src/**/*.ts"]
const TEST_FILES = ["src/**/*.test.ts"]
const ESTEST_FILES = ["src/**/*.estest.ts"]
const DEV_FILES = ["eslint.config.js"]

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: getIgnorePatterns(path.join(import.meta.dirname, ".gitignore")),
  },
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
]

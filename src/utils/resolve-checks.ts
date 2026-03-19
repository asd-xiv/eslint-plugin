import { evaluateArgument } from "@u/stringify-expression.js"
import type { Expression } from "acorn"

type RuleOption = {
  mode?: "or" | "and"
  checks: {
    argumentIndex?: number
    pattern?: string
    message: string
  }[]
}

type ResolvedRuleOption = {
  names: string[]
} & RuleOption

/**
 * Expand pipe-separated option keys into resolved options.
 *
 * @example
 * expandOptionKeys({
 *   "TypeError|RangeError": {...}
 * })
 * // => [{
 * //   names: ["TypeError", "RangeError"], mode: "or", checks: [...]
 * // }]
 */
const expandOptionKeys = (
  options?: Record<string, RuleOption>
): ResolvedRuleOption[] =>
  Object.entries(options ?? {}).map(([key, { mode = "or", checks }]) => ({
    names: key.split("|"),
    mode,
    checks,
  }))

/**
 * Resolve a possibly-negative argument index against total argument count.
 *
 * @example
 * resolveArgumentIndex(-1, 3) // => 2
 * resolveArgumentIndex(1, 3)  // => 1
 * resolveArgumentIndex(8, 3)  // => 2
 */
const resolveArgumentIndex = (index: number, totalArguments: number): number =>
  totalArguments === 0
    ? 0
    : ((index % totalArguments) + totalArguments) % totalArguments

type ChecksResult =
  | { status: "pass" }
  | { status: "fail"; node: Expression; message: string }
  | { status: "cannot_evaluate"; node: Expression }
  | { status: "missing_argument"; message: string }
  | { status: "skip" }

/**
 * Run checks against the given arguments with OR or AND exit semantics.
 *
 * - OR: first match = pass, exhausted without match = fail
 * - AND: first mismatch = fail, exhausted without mismatch = pass
 *
 * - No `pattern` = existence check; `pattern` defined = format check
 */
const runChecks = (
  checks: RuleOption["checks"],
  callArguments: Expression[],
  mode: RuleOption["mode"]
): ChecksResult => {
  let firstNode: Expression | undefined
  let firstMessage: string | undefined

  for (const check of checks) {
    const index = resolveArgumentIndex(
      check.argumentIndex ?? 0,
      callArguments.length
    )

    if (!check.pattern) {
      if (!callArguments[index]) {
        return { status: "missing_argument", message: check.message }
      }
      continue
    }

    const argument = callArguments[index]
    if (!argument) return { status: "missing_argument", message: check.message }

    firstNode ??= argument
    firstMessage ??= check.message

    const result = evaluateArgument(argument, check.pattern)
    if (result === "cannot_evaluate")
      return { status: "cannot_evaluate", node: argument }
    if (mode === "or" && result === "match") return { status: "pass" }
    if (mode === "and" && result === "mismatch")
      return { status: "fail", node: argument, message: check.message }
  }

  if (mode === "or") {
    return firstNode && firstMessage
      ? { status: "fail", node: firstNode, message: firstMessage }
      : { status: "skip" }
  }

  return { status: "pass" }
}

export { expandOptionKeys, runChecks, resolveArgumentIndex }
export type { RuleOption, ResolvedRuleOption, ChecksResult }

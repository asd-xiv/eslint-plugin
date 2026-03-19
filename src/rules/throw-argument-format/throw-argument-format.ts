import { expandOptionKeys, runChecks } from "@u/resolve-checks.js"
import type { RuleOption } from "@u/resolve-checks.js"
import type { Expression, ThrowStatement } from "acorn"
import type { Rule } from "eslint"

/**
 * Extract the error class name and arguments from a throw statement node.
 * Returns undefined for non-`new` throws or computed callees (`new errors["TypeError"]()`).
 *
 * @example
 * throw new TypeError("msg")  // => { name: "TypeError", callArguments: [...] }
 * throw new Error()           // => { name: "Error", allArguments: [] }
 * throw new errors["E"]()     // => undefined
 */
const getErrorSignature = (
  node: Rule.Node
): { name: string; callArguments: Expression[] } | undefined => {
  const { argument } = node as unknown as ThrowStatement

  if (
    argument.type === "NewExpression" &&
    argument.callee.type === "Identifier"
  ) {
    return {
      name: argument.callee.name,
      callArguments: argument.arguments as Expression[],
    }
  }

  return undefined
}

const checksSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      argumentIndex: { type: "integer" },
      pattern: { type: "string" },
      message: { type: "string" },
    },
    required: ["message"],
    additionalProperties: false,
  },
}

const ensureThrowArgumentFormat: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce consistent error message format in throw statements",
    },
    messages: {
      formatViolation: "{{message}}",
      missingArgument: "{{message}}",
      cannotEvaluate:
        "Cannot statically evaluate error message. Use a string literal or template literal",
    },
    schema: [
      {
        type: "object",
        additionalProperties: {
          type: "object",
          properties: {
            mode: { type: "string", enum: ["or", "and"] },
            checks: checksSchema,
          },
          required: ["checks"],
          additionalProperties: false,
        },
      },
    ],
  },
  create(context) {
    const resolvedOptions = expandOptionKeys(
      context.options[0] as Record<string, RuleOption>
    )
    if (resolvedOptions.length === 0) {
      return {}
    }

    return {
      ThrowStatement: node => {
        const error = getErrorSignature(node)
        if (!error) {
          return
        }

        const matchingOptions = resolvedOptions.filter(option =>
          option.names.includes(error.name)
        )
        if (matchingOptions.length === 0) {
          return
        }

        // AND across options: every matching option must pass
        for (const option of matchingOptions) {
          const result = runChecks(
            option.checks,
            error.callArguments,
            option.mode
          )

          if (result.status === "missing_argument") {
            context.report({
              node,
              messageId: "missingArgument",
              data: { message: result.message },
            })
            return
          }

          if (result.status === "cannot_evaluate") {
            context.report({
              node: result.node,
              messageId: "cannotEvaluate",
            })
            return
          }

          if (result.status === "fail") {
            context.report({
              node: result.node,
              messageId: "formatViolation",
              data: { message: result.message },
            })
            return
          }
        }
      },
    }
  },
}

export { ensureThrowArgumentFormat }

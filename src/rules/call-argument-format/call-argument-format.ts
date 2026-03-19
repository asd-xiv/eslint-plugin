import { expandOptionKeys, runChecks } from "@u/resolve-checks.js"
import type { RuleOption } from "@u/resolve-checks.js"
import type { CallExpression, Expression } from "acorn"
import type { Rule } from "eslint"

/**
 * Extract the function name and arguments from a call expression node.
 * Returns undefined for computed calls (`obj["method"]()`).
 *
 * @example
 * test("given x should y", () => {})  // => { name: "test", callArguments: [...] }
 * t.equal(a, b, "given x should y")   // => { name: "equal", callArguments: [...] }
 * obj["test"]("whatever")             // => undefined
 */
const getCalleeSignature = (
  node: Rule.Node
): { name: string; callArguments: Expression[] } | undefined => {
  const { callee, arguments: callArguments } = node as unknown as CallExpression

  // Direct call: test("..."), describe("...")
  if (callee.type === "Identifier") {
    return { name: callee.name, callArguments: callArguments as Expression[] }
  }

  // Method call: expect().toRaiseError(), t.equal()
  if (
    callee.type === "MemberExpression" &&
    callee.property.type === "Identifier"
  ) {
    return {
      name: callee.property.name,
      callArguments: callArguments as Expression[],
    }
  }

  return undefined
}

const ensureCallArgumentFormat: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce consistent argument format in function/method calls",
    },
    messages: {
      formatViolation: "{{message}}",
      missingArgument: "{{message}}",
      cannotEvaluate:
        "Cannot statically evaluate argument. Use a string literal or template literal",
    },
    schema: [
      {
        type: "object",
        additionalProperties: {
          type: "object",
          properties: {
            mode: { type: "string", enum: ["or", "and"] },
            checks: {
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
            },
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
      CallExpression: node => {
        const callee = getCalleeSignature(node)
        if (!callee) {
          return
        }

        const matchingOptions = resolvedOptions.filter(option =>
          option.names.includes(callee.name)
        )
        if (matchingOptions.length === 0) {
          return
        }

        // AND across options: every matching option must pass
        for (const option of matchingOptions) {
          const result = runChecks(
            option.checks,
            callee.callArguments,
            option.mode
          )

          if (result.status === "missing_argument") {
            context.report({
              node,
              messageId: "missingArgument",
              data: { message: result.message },
            })
            continue
          }

          if (result.status === "cannot_evaluate") {
            context.report({
              node: result.node,
              messageId: "cannotEvaluate",
            })
            continue
          }

          if (result.status === "fail") {
            context.report({
              node: result.node,
              messageId: "formatViolation",
              data: { message: result.message },
            })
          }
        }
      },
    }
  },
}

export { ensureCallArgumentFormat }

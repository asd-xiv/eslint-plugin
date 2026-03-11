import { stringifyExpression } from "@u/stringify-expression.js"
import type { Expression } from "acorn"
import type { Rule } from "eslint"

type Check = {
  pattern: string
  message: string
}

type Options = Record<string, Check[]>

const throwArgumentFormat: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce consistent error message format in throw statements",
    },
    messages: {
      formatViolation: "{{message}}",
      cannotEvaluate:
        "Cannot statically evaluate error message. Use a string literal or template literal",
    },
    schema: [
      {
        type: "object",
        additionalProperties: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pattern: { type: "string" },
              message: { type: "string" },
            },
            required: ["pattern", "message"],
            additionalProperties: false,
          },
        },
      },
    ],
  },
  create(context) {
    const ruleOptions = (context.options[0] ?? {}) as Options
    const errorClasses = Object.keys(ruleOptions)

    if (errorClasses.length === 0) {
      return {}
    }

    return {
      ThrowStatement(node) {
        // Only matching `throw new Error(...)`
        const argument = node.argument
        if (argument.type !== "NewExpression") {
          return
        }

        const callee = argument.callee
        if (callee.type !== "Identifier") {
          return
        }

        const checks = ruleOptions[callee.name]
        if (!checks || checks.length === 0) {
          return
        }

        const firstArgument = argument.arguments[0]
        if (!firstArgument) {
          return
        }

        // Turn AST -> string representation which we can match against the
        // user's RegExps
        const fullMessage = stringifyExpression(firstArgument as Expression)

        // Can't validate entirely opaque variable, function call, etc.
        if (fullMessage === "EXPR") {
          context.report({
            node: firstArgument,
            messageId: "cannotEvaluate",
          })

          return
        }

        // If ANY pattern matches, the message is valid.
        // Report the first check's message if none match.
        for (const check of checks) {
          const re = new RegExp(check.pattern)
          if (re.test(fullMessage)) {
            return
          }
        }

        context.report({
          node: firstArgument,
          messageId: "formatViolation",
          data: {
            message: checks[0]?.message,
          },
        })
      },
    }
  },
}

export { throwArgumentFormat }

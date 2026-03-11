import { stringifyExpression } from "@u/stringify-expression.js"
import type { Expression } from "acorn"
import type { Rule } from "eslint"

type Check = {
  argumentIndex?: number
  pattern?: string
  required?: boolean
  message: string
}

type Options = Record<string, Check[]>

type ResolvedEntry = {
  names: string[]
  checks: Check[]
}

const callArgumentFormat: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce consistent argument format in function/method calls",
    },
    messages: {
      formatViolation: "{{message}}",
      missingArgument: "{{message}}",
    },
    schema: [
      {
        type: "object",
        additionalProperties: {
          type: "array",
          items: {
            type: "object",
            properties: {
              argumentIndex: { type: "integer" },
              pattern: { type: "string" },
              required: { type: "boolean" },
              message: { type: "string" },
            },
            required: ["message"],
            additionalProperties: false,
          },
        },
      },
    ],
  },
  create(context) {
    const ruleOptions = (context.options[0] ?? {}) as Options
    const entries: ResolvedEntry[] = Object.entries(ruleOptions).map(
      ([key, checks]) => ({
        names: key.split("|"),
        checks,
      })
    )

    if (entries.length === 0) {
      return {}
    }

    const findChecks = (name: string): Check[] | undefined => {
      for (const entry of entries) {
        if (entry.names.includes(name)) {
          return entry.checks
        }
      }

      return undefined
    }

    const getCalleeName = (node: Rule.Node): string | undefined => {
      // Direct call: test("..."), describe("...")
      if (node.type === "Identifier") {
        return node.name
      }

      // Method call: expect().toRaiseError(), t.equal()
      if (
        node.type === "MemberExpression" &&
        node.property.type === "Identifier"
      ) {
        return node.property.name
      }

      return undefined
    }

    return {
      CallExpression(node) {
        const name = getCalleeName(node.callee as Rule.Node)
        if (!name) {
          return
        }

        const checks = findChecks(name)
        if (!checks || checks.length === 0) {
          return
        }

        for (const check of checks) {
          const index = check.argumentIndex ?? 0
          const resolvedIndex =
            index < 0 ? node.arguments.length + index : index
          const argument = node.arguments[resolvedIndex]

          // required: true — just assert the argument exists
          if (check.required) {
            if (!argument) {
              context.report({
                node,
                messageId: "missingArgument",
                data: { message: check.message },
              })
            }

            continue
          }

          // No argument at this index — skip pattern checks
          if (!argument) {
            continue
          }

          // No pattern configured — skip
          if (!check.pattern) {
            continue
          }

          const value = stringifyExpression(argument as Expression)
          const re = new RegExp(check.pattern)

          if (!re.test(value)) {
            context.report({
              node: argument,
              messageId: "formatViolation",
              data: { message: check.message },
            })
          }
        }
      },
    }
  },
}

export { callArgumentFormat }

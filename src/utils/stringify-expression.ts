/* eslint-disable @typescript-eslint/no-non-null-assertion -- loop bounds guarantee valid indices */
import type { Expression } from "acorn"

/**
 * Flatten an AST expression node into a plain string, replacing all
 * non-literal parts (interpolations, function calls, identifiers) with
 * the placeholder "EXPR".
 */
const stringifyExpression = (node: Expression): string => {
  // String literals: "hello" → "hello"
  if (node.type === "Literal" && typeof node.value === "string") {
    return node.value
  }

  // Template literals: `got '${type(x)}'` → `got 'EXPR'`
  if (node.type === "TemplateLiteral") {
    let result = ""

    for (let i = 0; i < node.quasis.length; i++) {
      result += node.quasis[i]!.value.raw

      if (i < node.quasis.length - 1) {
        result += "EXPR"
      }
    }

    return result
  }

  // Binary `+` chains: `"a" + expr + "b"` → "aEXPRb"
  if (node.type === "BinaryExpression" && node.operator === "+") {
    // Acorn types `left` as `Expression | PrivateIdentifier` because
    // BinaryExpression covers `a in #field` (the `in` operator can have
    // a PrivateIdentifier on the right). For `+` this can never happen.
    const left = stringifyExpression(node.left as Expression)
    const right = stringifyExpression(node.right)

    return left + right
  }

  // Any unrecognized node (call expressions, identifiers, etc.)
  // is treated as an opaque interpolation.
  return "EXPR"
}

type ArgumentEvaluation = "match" | "mismatch" | "cannot_evaluate"

/**
 * Evaluate an AST expression node against a pattern string.
 * Returns "cannot_evaluate" if the expression is not statically resolvable.
 *
 * @example
 * evaluateArgument(literalNode, "^hello")  // => "match" | "mismatch"
 * evaluateArgument(identifierNode, ".*")   // => "cannot_evaluate"
 */
const evaluateArgument = (
  argument: Expression,
  pattern: string
): ArgumentEvaluation => {
  const value = stringifyExpression(argument)
  if (value === "EXPR") return "cannot_evaluate"
  return new RegExp(pattern).test(value) ? "match" : "mismatch"
}

export { stringifyExpression, evaluateArgument }
export type { ArgumentEvaluation }

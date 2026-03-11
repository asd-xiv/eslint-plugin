import { strictEqual } from "node:assert"
import { describe, test } from "node:test"
import { parseExpressionAt } from "acorn"

import { flattenExpression } from "./flatten-expression.js"

const parseExpression = (code: string) =>
  parseExpressionAt(code, 0, { ecmaVersion: 2022, sourceType: "module" })

describe("flattenExpression - valid", () => {
  // Plain string, no interpolation
  test("string literal", () => {
    strictEqual(flattenExpression(parseExpression("'hello'")), "hello")
  })

  // Template without interpolations
  test("template literal, no interpolation", () => {
    strictEqual(flattenExpression(parseExpression("`hello`")), "hello")
  })

  // Single interpolation: `got '${x}'`
  test("template literal, one interpolation", () => {
    strictEqual(
      flattenExpression(parseExpression("`got '${x}'`")),
      "got 'EXPR'"
    )
  })

  // Multiple interpolations: `${a} and ${b} end`
  test("template literal, multiple interpolations", () => {
    strictEqual(
      flattenExpression(parseExpression("`${a} and ${b} end`")),
      "EXPR and EXPR end"
    )
  })

  // "str" + fn() → two-segment concat
  test("string + call expression", () => {
    strictEqual(
      flattenExpression(parseExpression("'prefix ' + fn()")),
      "prefix EXPR"
    )
  })

  // ("str" + fn()) + "'" → three-segment, mirrors real throw patterns
  test("nested binary + chain", () => {
    strictEqual(
      flattenExpression(parseExpression("'expected ' + fn() + \"'\"")),
      "expected EXPR'"
    )
  })
})

describe("flattenExpression - invalid", () => {
  // Non-string literals
  test("numeric literal", () => {
    strictEqual(flattenExpression(parseExpression("42")), "EXPR")
  })

  // Non-+ binary operators
  test("binary minus", () => {
    strictEqual(flattenExpression(parseExpression("a - b")), "EXPR")
  })

  // Call expressions, identifiers — anything unknown
  test("call expression", () => {
    strictEqual(flattenExpression(parseExpression("fn()")), "EXPR")
  })

  test("identifier", () => {
    strictEqual(flattenExpression(parseExpression("x")), "EXPR")
  })
})

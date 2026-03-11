import { strictEqual } from "node:assert"
import { describe, test } from "node:test"
import { parseExpressionAt } from "acorn"

import { stringifyExpression } from "./stringify-expression.js"

const parseExpression = (code: string) =>
  parseExpressionAt(code, 0, { ecmaVersion: 2022, sourceType: "module" })

describe("stringifyExpression - valid", () => {
  // Plain string, no interpolation
  test("string literal", () => {
    strictEqual(stringifyExpression(parseExpression("'hello'")), "hello")
  })

  // Template without interpolations
  test("template literal, no interpolation", () => {
    strictEqual(stringifyExpression(parseExpression("`hello`")), "hello")
  })

  // Single interpolation: `got '${x}'`
  test("template literal, one interpolation", () => {
    strictEqual(
      stringifyExpression(parseExpression("`got '${x}'`")),
      "got 'EXPR'"
    )
  })

  // Multiple interpolations: `${a} and ${b} end`
  test("template literal, multiple interpolations", () => {
    strictEqual(
      stringifyExpression(parseExpression("`${a} and ${b} end`")),
      "EXPR and EXPR end"
    )
  })

  // "str" + fn() → two-segment concat
  test("string + call expression", () => {
    strictEqual(
      stringifyExpression(parseExpression("'prefix ' + fn()")),
      "prefix EXPR"
    )
  })

  // ("str" + fn()) + "'" → three-segment, mirrors real throw patterns
  test("nested binary + chain", () => {
    strictEqual(
      stringifyExpression(parseExpression("'expected ' + fn() + \"'\"")),
      "expected EXPR'"
    )
  })
})

describe("stringifyExpression - invalid", () => {
  // Non-string literals
  test("numeric literal", () => {
    strictEqual(stringifyExpression(parseExpression("42")), "EXPR")
  })

  // Non-+ binary operators
  test("binary minus", () => {
    strictEqual(stringifyExpression(parseExpression("a - b")), "EXPR")
  })

  // Call expressions, identifiers — anything unknown
  test("call expression", () => {
    strictEqual(stringifyExpression(parseExpression("fn()")), "EXPR")
  })

  test("identifier", () => {
    strictEqual(stringifyExpression(parseExpression("x")), "EXPR")
  })
})

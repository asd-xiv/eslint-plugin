import { strictEqual } from "node:assert"
import { describe, test } from "node:test"
import { parseExpressionAt } from "acorn"

import { stringifyExpression } from "./stringify-expression.js"

const parseExpression = (code: string) =>
  parseExpressionAt(code, 0, { ecmaVersion: 2022, sourceType: "module" })

describe("stringifyExpression - valid", () => {
  test("given [plain string] should [return its content]", () => {
    strictEqual(stringifyExpression(parseExpression("'hello'")), "hello")
  })

  test("given [template literal without interpolation] should [return its content]", () => {
    strictEqual(stringifyExpression(parseExpression("`hello`")), "hello")
  })

  test("given [template literal with one interpolation] should [replace with EXPR]", () => {
    strictEqual(
      stringifyExpression(parseExpression("`got '${x}'`")),
      "got 'EXPR'"
    )
  })

  test("given [template literal with multiple interpolations] should [replace all with EXPR]", () => {
    strictEqual(
      stringifyExpression(parseExpression("`${a} and ${b} end`")),
      "EXPR and EXPR end"
    )
  })

  test("given [string + call expression] should [concat with EXPR]", () => {
    strictEqual(
      stringifyExpression(parseExpression("'prefix ' + fn()")),
      "prefix EXPR"
    )
  })

  test("given [nested binary + chain] should [concat with EXPR]", () => {
    strictEqual(
      stringifyExpression(parseExpression("'expected ' + fn() + \"'\"")),
      "expected EXPR'"
    )
  })
})

describe("stringifyExpression - invalid", () => {
  test("given [numeric literal] should [return EXPR]", () => {
    strictEqual(stringifyExpression(parseExpression("42")), "EXPR")
  })

  test("given [binary minus] should [return EXPR]", () => {
    strictEqual(stringifyExpression(parseExpression("a - b")), "EXPR")
  })

  test("given [call expression] should [return EXPR]", () => {
    strictEqual(stringifyExpression(parseExpression("fn()")), "EXPR")
  })

  test("given [identifier] should [return EXPR]", () => {
    strictEqual(stringifyExpression(parseExpression("x")), "EXPR")
  })
})

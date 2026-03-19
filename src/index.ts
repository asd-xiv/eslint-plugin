import packageJSON from "../package.json" with { type: "json" }

import { ensureCallArgumentFormat } from "./rules/call-argument-format/call-argument-format.js"
import { ensureThrowArgumentFormat } from "./rules/throw-argument-format/throw-argument-format.js"

const plugin = {
  meta: { name: packageJSON.name, version: packageJSON.version },
  rules: {
    "call-argument-format": ensureCallArgumentFormat,
    "throw-argument-format": ensureThrowArgumentFormat,
  },
}

export default plugin
export { ensureCallArgumentFormat, ensureThrowArgumentFormat }

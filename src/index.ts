import packageJSON from "../package.json" with { type: "json" }

import { callArgumentFormat } from "./rules/call-argument-format/call-argument-format.js"
import { throwArgumentFormat } from "./rules/throw-argument-format/throw-argument-format.js"

const plugin = {
  meta: { name: packageJSON.name, version: packageJSON.version },
  rules: {
    "call-argument-format": callArgumentFormat,
    "throw-argument-format": throwArgumentFormat,
  },
}

export default plugin
export { callArgumentFormat, throwArgumentFormat }

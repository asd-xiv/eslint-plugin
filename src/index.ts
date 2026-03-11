import packageJSON from "../package.json" with { type: "json" }

import { throwArgumentFormat } from "./rules/throw-argument-format/throw-argument-format.js"

const plugin = {
  meta: { name: packageJSON.name, version: packageJSON.version },
  rules: {
    "throw-argument-format": throwArgumentFormat,
  },
}

export default plugin
export { throwArgumentFormat }

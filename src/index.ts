import packageJSON from "../package.json" with { type: "json" }

import { errorMessageFormat } from "./rules/error-message-format/error-message-format.js"

const plugin = {
  meta: { name: packageJSON.name, version: packageJSON.version },
  rules: {
    "error-message-format": errorMessageFormat,
  },
}

export default plugin
export { errorMessageFormat }

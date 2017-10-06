const store = require("../store")

const logInfo = (logs, style = "%s") => {
  const { logLevel = 1, spaceIndent = 2 } = store.getState()

  const padding = Array(logLevel * spaceIndent + 1).join(" ")
  const paddingWithRootSlash = logLevel > 0 ? `${padding}\\__` : padding

  const isArr = Array.isArray(logs)
  const isStr = typeof logs === "string"

  switch (true) {
    case isArr: {
      console.log(style, `[INFO] ${paddingWithRootSlash}`, ...logs)
      break
    }
    case isStr: {
      console.log(style, `[INFO] ${paddingWithRootSlash}${logs}`)
      break
    }
    default: {
      console.log(style, `[INFO] ${paddingWithRootSlash}`, logs)
      break
    }
  }

  return
}

module.exports = logInfo

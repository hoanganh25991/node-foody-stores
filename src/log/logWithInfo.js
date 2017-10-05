const config = {
  spaceIndent: 2
}
const logWithInfo = (logs, subLevel = 0, style = "%s") => {
  const padding = Array(subLevel * config.spaceIndent + 1).join(" ")
  const paddingWithRootSlash = subLevel > 0 ? `${padding}\\__` : padding

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

var exports = (module.exports = logWithInfo)

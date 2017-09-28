const config = {
  spaceIndent: 2
}
const logWithInfo = (log, subLevel = 0) => {
  if (typeof log !== "string") {
    console.log("[INFO]", log)
  }

  const padding = Array(subLevel * config.spaceIndent + 1).join("_")
  const paddingWithRootSlash = subLevel > 0 ? `\\${padding}` : padding
  console.log(`[INFO] ${paddingWithRootSlash}${log}`)
  return
}

var exports = (module.exports = logWithInfo)

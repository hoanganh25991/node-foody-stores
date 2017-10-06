const store = require("../store")

const logWithInfo = require("./logWithInfo")
const logDebug = (logs, style = "%s") => {
  const { debugLogLevel = 10 } = store.getState()

  const debug = process.env.DEBUG
  const logLevel = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 0
  const shouldLog = debug && debug != "false" && logLevel <= debugLogLevel

  if (shouldLog) logWithInfo(logs, style)
}
module.exports = logDebug

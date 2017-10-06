const store = require("../store")

const logWithInfo = require("./logInfo")
const logDebug = (logs, style = "%s") => {
  const { debugLogLevel = 10 } = store.getState()

  const debug = process.env.DEBUG
  const logLevel = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 0

  const shouldDebug = debug && debug != "false"
  const allowedLogLevel = logLevel <= debugLogLevel
  const shouldLog = shouldDebug && allowedLogLevel

  if (shouldLog) logWithInfo(logs, style)
}
module.exports = logDebug

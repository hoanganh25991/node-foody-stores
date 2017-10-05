const logWithInfo = require("./logWithInfo")
const logDebug = (logs, sublevel = 0, style = "%s") => {
  const debug = process.env.DEBUG
  const logLevel = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 0
  if (debug && debug != "false" && logLevel <= sublevel) logWithInfo(logs, sublevel, style)
}
module.exports = logDebug

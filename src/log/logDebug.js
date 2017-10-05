const logWithInfo = require("./logWithInfo")
const logDebug = (logs, sublevel = 0) => {
  const debug = process.env.DEBUG
  if (debug && debug != "false") logWithInfo(logs, sublevel)
}
module.exports = logDebug

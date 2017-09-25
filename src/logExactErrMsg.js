const logWithInfo = require("./logWithInfo")

const logExactErrorMsg = (err) => {
  let shouldLog = err
  if(typeof err === "object" && err.message) shouldLog  = err.message
  logWithInfo(shouldLog)
}

var exports = module.exports = logExactErrorMsg
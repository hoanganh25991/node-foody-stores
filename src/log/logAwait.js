const logInfo = require("./logInfo")
var logSingleLine = require("single-line-log").stdout

const logAwait = async (callback, args, taskName = "No task name") => {
  console.time(taskName)
  logInfo(taskName)
  let count = 0
  const limit = 100
  const timeId = setInterval(() => {
    count++

    if (count > limit) {
      count = 0
    }

    const percent = Array(count + 1).join("#")
    const remain = Array(limit - count + 1).join(" ")
    logSingleLine(`[${percent}=>${remain}]`)
  }, 2000)
  const result = await callback(args)
  clearInterval(timeId)
  console.timeEnd(taskName)
  return result
}

module.exports = logAwait

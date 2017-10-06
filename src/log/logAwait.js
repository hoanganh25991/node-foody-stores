const logInfo = require("./logInfo")
var logSingleLine = require("single-line-log").stdout

const logAwait = async (callback, args, taskName = "No task name") => {
  console.time(taskName)
  let count = 0
  const limit = 100
  const timeId = setInterval(() => {
    count++

    if (count > limit) {
      count = 0
    }
    var percentage = Math.floor(100 * count / limit)
    const percent = Array(count + 1).join("#")
    logSingleLine(`Writing to super large file\n[${percentage}%]`, percent)
  }, 300)
  const result = await callback(args)
  clearInterval(timeId)
  console.timeEnd(taskName)
  logSingleLine.clear()
  return result
}

module.exports = logAwait

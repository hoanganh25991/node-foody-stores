const logWithInfo = require("./logWithInfo")

const infoAwait = async (callback, args, taskName = "No task name") => {
  console.time(taskName);
  logWithInfo(taskName)
  const timeId = setInterval(() => logWithInfo(`...`), 2000)
  const result = await callback(args)
  clearInterval(timeId)
  console.timeEnd(taskName);
  return result
}

var exports = module.exports = infoAwait
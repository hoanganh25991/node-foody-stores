const logWithInfo = require("./logWithInfo")
const timeout = {
  timeoutCount: 0, // count as seconds
  store: (timeout, type = "s") => {
    let added, puppeteerTimeout
    switch (type) {
      case "s":
        added = timeout
        puppeteerTimeout = timeout * 1000
        break
      case "ms":
        added = timeout / 1000
        puppeteerTimeout = timeout
        break
      default:
        throw new Error("Unknown time format")
    }
    timeout.timeoutCount += added
    return { timeout: puppeteerTimeout }
  },
  log: () => {
    logWithInfo(`You have timeout for ${timeout.timeoutCount}s`)
  }
}

var exports = (module.exports = timeout)

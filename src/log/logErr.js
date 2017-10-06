const logErr = err => {
  if (typeof err === "object" && err.message) console.log("\x1b[31m%s\x1b[0m", `[ERR] ${err.message}`)
  console.log("\x1b[31m%s\x1b[0m", "[ERR]", err)
}

module.exports = logErr

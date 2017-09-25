const logWithInfo = (log) => {
  if(typeof log !== "string"){
    console.log("[INFO]", log)
  }

  console.log(`[INFO] ${log}`)
  return
}

var exports = module.exports = logWithInfo 
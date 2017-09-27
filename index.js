const findStore = require("./src/findStore")
const logWithInfo = require("./src/logWithInfo")
const logExactErrMsg = require("./src/logExactErrMsg")

const run = async function() {
  const pageInfo = await findStore()
  console.log(pageInfo)
}

const crawling = async () => {
  try {
    await run()
  } catch (err) {
    logExactErrMsg(err)
  } finally {
    // Auto re run
    // setTimeout(crawling, 6000)
    logWithInfo("==============COMPLETE CRAWLING FOODY==============")
    process.exit()
  }
}

// Ok, start
crawling()

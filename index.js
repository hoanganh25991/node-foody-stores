const logWithInfo = require("./src/logWithInfo")
const logExactErrMsg = require("./src/logExactErrMsg")
const findStore = require("./src/findStore")
const callFoodyApi = require("./src/callFoodyApi")

const run = async function() {
  const pageInfo = await findStore()
  // console.log(pageInfo)
  // const apiUrl = "https://www.foody.vn/ho-chi-minh/an-vat-via-he-tai-quan-2?c=an-vat-via-he"
  // const stores = await callFoodyApi(apiUrl)
}

const crawling = async () => {
  try {
    await run()
  } catch (err) {
    logExactErrMsg(err)
  } finally {
    // Auto re callApiUrl
    // setTimeout(crawling, 6000)
    logWithInfo("==============COMPLETE CRAWLING FOODY==============")
    process.exit()
  }
}

// Ok, start
crawling()

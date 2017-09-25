const tryReadPage = require("./src/tryReadPage")
const logWithInfo = require("./src/logWithInfo")
const logExactErrMsg = require("./src/logExactErrMsg")

const run = async function(){
  const homepage = "https://www.foody.vn";
  // Info we are finding page link
  const pageInfo = await tryReadPage(homepage)
  console.log(pageInfo)
}

const crawling = async () => {
  try{
    await run()
  }catch(err){
    logExactErrMsg(err)
  }finally{
    // Auto re run
    // setTimeout(crawling, 6000)
    logWithInfo("==============COMPLETE CRAWLING LIFETRICKS==============")
    process.exit();
  }
}

// Ok, start
crawling()

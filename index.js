const findStore = require("./src/findStore")
const logWithInfo = require("./src/logWithInfo")
const logExactErrMsg = require("./src/logExactErrMsg")

const run = async function(){
  const homepage = "https://www.foody.vn/#/places";
  // Info we are finding page link
  const pageInfo = await findStore(homepage)
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
    logWithInfo("==============COMPLETE CRAWLING FOODY==============")
    process.exit();
  }
}

// Ok, start
crawling()

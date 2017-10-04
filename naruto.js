const findNarutoVideo = require("./src/findNarutoVideo")
const logWithInfo = require("./src/logWithInfo")
const logExactErrMsg = require("./src/logExactErrMsg")

const NarutoVideoUrl = () => {
  const before = "http://www4.naruspot.tv/watch/naruto-episode-"
  const after = "-dubbed/"
  return {
    forChapter(chapter) {
      return `${before}${chapter}${after}`
    }
  }
}

const run = async function() {
  const startChapter = 106
  const endChapter = 106
  let curr = startChapter
  const narutoVideoUrl = NarutoVideoUrl()
  while (curr <= endChapter) {
    const currChapterUrl = narutoVideoUrl.forChapter(curr)
    const pageInfo = await findNarutoVideo(currChapterUrl)
    console.log(pageInfo)
    curr++
  }
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

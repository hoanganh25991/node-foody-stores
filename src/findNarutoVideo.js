const defer = require("./defer")
const logWithInfo = require("./logWithInfo")
const puppeteer = require("puppeteer")
const { puppeteer: config } = require("./config")
const logExactErrMsg = require("./logExactErrMsg")
const { screenshot } = require("./pageUtils")
const screenshotDir = "video"

const NetworkManager = page => {
  const requestUrlList = []
  const requestList = []
  page.on("request", interceptedRequest => {
    requestList.push(interceptedRequest)
    requestUrlList.push(interceptedRequest.url)
    if (interceptedRequest.url.endsWith(".jpg") || interceptedRequest.url.endsWith(".jpg")) interceptedRequest.abort()
    else interceptedRequest.continue()
  })
  return {
    log() {
      logWithInfo(`[NetworkManager] Summary: ${requestUrlList.length} requets`)
    },
    get() {
      return requestList
    },
    getUrl() {
      return requestUrlList
    }
  }
}

const fs = require("fs")

const findNarutoVideo = async chapterUrl => {
  try {
    logWithInfo(chapterUrl)
    const browser = await puppeteer.launch(config.launch)
    const page = await browser.newPage()
    await page.goto(chapterUrl, { waitUntil: "networkidle" })
    await page.setRequestInterceptionEnabled(true)
    const networKManger = NetworkManager(page)
    await page.waitFor(30 * 1000)
    networKManger.log()
    // const reqList = networKManger.get()
    // const videoMp4Req = reqList.filter(req => req.url.includes("video.mp4"))
    // const url = videoMp4Req[0] &&  videoMp4Req[0].url
    // logWithInfo(url)
    // const urlX = networKManger.getUrl()
    // fs.writeFileSync("abc.log", JSON.stringify(urlX))
    // logWithInfo(urlX)
    const a = await page.frames()
    const urls = a.map(fr => fr.url())
    fs.writeFileSync("abc.log", JSON.stringify(urls))
    await browser.close()
    return "hello"
  } catch (err) {
    logExactErrMsg(err)
  }
}

var exports = (module.exports = findNarutoVideo)

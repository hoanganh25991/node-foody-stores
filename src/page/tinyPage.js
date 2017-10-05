const puppeteer = require("puppeteer")
const { puppeteer: puppeteerConf } = require("../_config")
const NetworkManager = require("./NetworkManager")
const { logDebug } = require("../log")

let browser

const getBrowser = async () => {
  if (browser) return browser
  browser = await puppeteer.launch(puppeteerConf.launch)
  return browser
}

const TinyPage = async () => {
  const _browser = await getBrowser()
  //noinspection JSUnresolvedVariable
  const page = await _browser.newPage()
  await NetworkManager(page)
  return page
}

TinyPage.closeBrowser = async () => {
  let _browser = await getBrowser()
  await _browser.close()
}

module.exports = TinyPage

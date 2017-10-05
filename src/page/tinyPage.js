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
  const _browser = getBrowser()
  //noinspection JSUnresolvedVariable
  const page = await _browser.newPage()
  await NetworkManager(page)
  // Enhance page, close BOTH page and browser
  page.closeBrowser = async () => {
    await _browser.close()
  }
  return page
}

module.exports = TinyPage

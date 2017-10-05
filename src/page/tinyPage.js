const puppeteer = require("puppeteer")
const { puppeteer: puppeteerConf } = require("../_config")
const NetworkManager = require("./NetworkManager")

const TinyPage = async () => {
  //noinspection JSUnresolvedVariable
  const browser = await puppeteer.launch(puppeteerConf.launch)
  const page = await browser.newPage()
  await NetworkManager(page)
  // Enhance page, close BOTH page and browser
  const _pageClose = page.close
  page.close = async () => {
    await _pageClose()
    await browser.close()
  }
  return page
}

module.exports = TinyPage

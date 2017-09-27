const defer = require("./defer")
const log = require("./logWithInfo")
const timeout = require("./timeout")
const puppeteer = require("puppeteer")
const { puppeteer: config } = require("./config")
const logExactErrMsg = require("./logExactErrMsg")
const { screenshot, dismisPopup, clickAndWait } = require("./pageUtils")

const homepage = "https://www.foody.vn/#/places"

const steps = [
  { selector: "#searchFormTop > div > a", waitFor: "#fdDlgSearchFilter > div.sf-right" },
  { selector: "#search-filter-dis-4" },
  { selector: "#fdDlgSearchFilter > div.sf-left > ul > li:nth-child(3)", waitFor: "#search-filter-cate-11" },
  { selector: "#search-filter-cate-11" },
  { selector: "#fdDlgSearchFilter > div.sf-bottom > div > a.fd-btn.blue" }
]

const resultSelector =
  "#GalleryPopupApp > div.directory-container > div > div > div > div > div.result-side > div.head-result.d_resultfilter"

const findStore = async () => {
  const browser = await puppeteer.launch(config.launch)
  const page = await browser.newPage()
  await page.goto(homepage)
  await page.setViewport({ width: 1200, height: 1014 })
  await dismisPopup(page)("#popup-choose-category > ul > li:nth-child(1) > a")
  await screenshot(page)({ path: `before.png` })

  const startQueue = Promise.resolve(log("Starting await queue..."))
  await steps.reduce(async (carry, { selector, waitFor }, index) => {
    await carry
    return clickAndWait(page)({ selector, waitFor }, index)
  }, startQueue)

  await page.waitForSelector(resultSelector)
  await screenshot(page)({ path: `after.png` })
  await browser.close()
  timeout.log()
  return "hello"
}

var exports = (module.exports = findStore)

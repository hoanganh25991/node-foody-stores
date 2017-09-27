const puppeteer = require("puppeteer")
const { puppeteer: config } = require("./config")
const defer = require("./defer")
const logWithInfo = require("./logWithInfo")
const logExactErrMsg = require("./logExactErrMsg")

const TM = {
  timeoutCount: 0, // count as seconds
  store: (timeout, type = "s") => {
    let added, puppeteerTimeout
    switch (type) {
      case "s":
        added = timeout
        puppeteerTimeout = timeout * 1000
        break
      case "ms":
        added = timeout / 1000
        puppeteerTimeout = timeout
        break
      default:
        throw new Error("Unknown time format")
    }
    TM.timeoutCount += added
    return { timeout: puppeteerTimeout }
  },
  log: () => {
    logWithInfo(`You have timeout for ${TM.timeoutCount}s`)
  }
}

const screenshot = page => async options => {
  await page.screenshot(options)
}

const dismisPopup = page => async selector => {
  const popup = await page.$(selector)
  await popup.click()
  /**
   * We check offsetParent as NULL to check if element visible or not
   * @see https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom#21696585
   */
  const cmd = `document.querySelector("${selector}").offsetParent === null`
  await page.waitForFunction(cmd, TM.store(5))
}

const clickAndWait = page => async ({ selector, waitFor = "body" }, index) => {
  const stepButton = await page.$(selector)
  logWithInfo(`Find ${selector}: ${Boolean(stepButton)}`)
  await stepButton.click()
  await page.waitForSelector(waitFor, TM.store(5))
  await screenshot(page)({ path: `step${index}.jpeg`, quality: 100 })
}

const findStore = async homepage => {
  const browser = await puppeteer.launch(config.launch)
  const page = await browser.newPage()
  await page.goto(homepage)
  // await page.setViewport({ width: 1200, height: 1014 })
  await dismisPopup(page)("#popup-choose-category > ul > li:nth-child(1) > a")
  await screenshot(page)({ path: `before.png` })

  const steps = [
    { selector: "#searchFormTop > div > a", waitFor: "#fdDlgSearchFilter > div.sf-right" },
    { selector: "#search-filter-dis-4" },
    { selector: "#fdDlgSearchFilter > div.sf-left > ul > li:nth-child(3)", waitFor: "#search-filter-cate-11" },
    { selector: "#search-filter-cate-11" },
    { selector: "#fdDlgSearchFilter > div.sf-bottom > div > a.fd-btn.blue" }
  ]
  /**
   * @notice
   * Please remeber that map/forEach CANT run async/await in concept of
   * Run for index 0, then run for index 1,...
   * callback will be executed
   * after running map, we have [(executed), (executed), (executed),...]
   * then await [(),(),()]
   * >>> this is just await all
   *
   * Please read reduce function, to see exactly how to QUEUE IT
   */
  // await steps.map(async ({ selector, waitFor }, index) => {
  //   await clickAndWait(page)({ selector, waitFor }, index)
  // })

  const startQueue = Promise.resolve(logWithInfo("Starting await queue..."))
  await steps.reduce(async (carry, { selector, waitFor }, index) => {
    await carry
    return clickAndWait(page)({ selector, waitFor }, index)
  }, startQueue)
  TM.log()
  await page.waitForSelector(
    "#GalleryPopupApp > div.directory-container > div > div > div > div > div.result-side > div.head-result.d_resultfilter"
  )
  await screenshot(page)({ path: `after.png` })
  await browser.close()
  return "hello"
}

var exports = (module.exports = findStore)

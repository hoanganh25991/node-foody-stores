const puppeteer = require("puppeteer")
const { puppeteer: config } = require("./config")
const defer = require("./defer")

const timeout = {
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
    this.timeoutCount += added
    return { timeout: puppeteerTimeout }
  },
  log: () => {
    console.log(`[INFO] You have timeout for ${this.timeoutCount}`)
  }
}

const dismisPopup = page => async selector => {
  const popup = await page.$(selector)
  await popup.click()
  /**
   * We check offsetParent as NULL to check if element visible or not
   * @see https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom#21696585
   */
  const cmd = `document.querySelector("${selector}").offsetParent === null`
  await page.waitForFunction(cmd)
}

const clickAndWait = page => async ({ selector, waitFor = "body" }, index) => {
  const stepButton = await page.$(selector)
  await stepButton.click()
  await page.waitForSelector(waitFor)
  await page.screenshot({ path: `step${index}.png` })
}

const findStore = async homepage => {
  const browser = await puppeteer.launch(config.launch)
  const page = await browser.newPage()
  await page.goto(homepage)
  await page.setViewport({ width: 1200, height: 1014 })
  await dismisPopup(page)("#popup-choose-category > ul > li:nth-child(1) > a")
  await page.screenshot({ path: `before.png` })

  const steps = [
    { selector: "#searchFormTop > div > a", waitFor: "#fdDlgSearchFilter > div.sf-right" },
    { selector: "#search-filter-dis-4" },
    { selector: "#fdDlgSearchFilter > div.sf-left > ul > li:nth-child(3)", waitFor: "#search-filter-cate-11" },
    { selector: "#search-filter-cate-11" },
    { selector: "#fdDlgSearchFilter > div.sf-bottom > div > a.fd-btn.blue", waitFor: "" }
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

  steps.reduce(async (carry, { selector, waitFor }, index) => {
    await carry
    return clickAndWait(page)({ selector, waitFor }, index)
  }, Promise.resolve(console.log("Starting await queue...")))

  timeout.log()

  await defer(3)
  await page.screenshot({ path: `after.png` })
  await browser.close()
  return "hello"
}

var exports = (module.exports = findStore)

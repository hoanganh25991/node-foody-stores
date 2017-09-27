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

const c = {
  loginButton: "#accountmanager > a",
  clickLogin: "#fdDlgLogin > div.frame > div.btns.col2.bottom > a.btn.btn-login",
  emailInput: "#Email",
  passInput: "#Password",
  submitButton: "#bt_submit"
}

const screenshotDir = "screenshot"

const contentItemSelector = "#result-box > div.row-view > div > div > div"

const findStore = async () => {
  const browser = await puppeteer.launch(config.launch)
  const page = await browser.newPage()
  await page.goto(homepage)
  await page.setViewport({ width: 1200, height: 600 })
  await dismisPopup(page)("#popup-choose-category > ul > li:nth-child(1) > a")
  await screenshot(page)({ path: `${screenshotDir}/before.jpeg`, quality: 20 })

  // Have to login, foddy damn crazy
  // A lot of bug happens, when user NOT LOGGINED IN
  const loginButton = await page.$(c.loginButton)
  await loginButton.click()
  await page.waitForSelector(c.clickLogin)

  const clickLogin = await page.$(c.clickLogin)
  await clickLogin.click()
  const redirectToLoginUrl = `window.location.href.includes("id.foody.vn")`
  await page.waitForFunction(redirectToLoginUrl)

  await screenshot(page)({ path: `${screenshotDir}/login-page.jpeg`, quality: 20 })

  await page.focus(c.emailInput)
  page.type("hoanganh_25991@yahoo.com.vn")

  await page.focus(c.passInput)
  page.type("wckmaemi")

  const submitBtn = await page.$(c.submitButton)
  await submitBtn.click()
  const redirectToHomePageUrl = `window.location.href=="https://www.foody.vn/#/places"`
  await page.waitForFunction(redirectToHomePageUrl)

  await screenshot(page)({ path: `${screenshotDir}/logged-in.jpeg`, quality: 20 })

  const startQueue = Promise.resolve(log("Starting await queue..."))
  await steps.reduce(async (carry, { selector, waitFor }, index) => {
    await carry
    return clickAndWait(page)({ selector, waitFor }, index)
  }, startQueue)

  await page.waitForSelector(resultSelector)

  const seeResult = await page.evaluate(async () => {
    const contentItemSelector = "#result-box > div.row-view > div > div > div"
    const defer = async waitTime => await new Promise(resolve => setTimeout(resolve, waitTime * 1000))
    const forcePageLoadMoreContent = async (waitForFunction = () => true, options = { timeout: 30 }) => {
      const body = document.body
      const documentCurrHeight = body.clientHeight
      window.scrollBy(0, documentCurrHeight)
      await defer(1)
      let count = 0
      const { timeout } = options
      while (!waitForFunction() && count < timeout) {
        await defer(1)
        count++
      }
    }

    // Wait for items load
    await forcePageLoadMoreContent()

    const loadMoreButton = document.querySelector("#scrollLoadingPage")

    let currNumItems = document.querySelectorAll(contentItemSelector).length

    let allItemsLoaded = false
    while (!allItemsLoaded) {
      loadMoreButton.click()
      await forcePageLoadMoreContent(() => {
        const next = document.querySelectorAll(contentItemSelector).length
        return next > currNumItems
      })
      const loadButtonIsHidden = loadMoreButton.offsetParent === null
      if (loadButtonIsHidden) allItemsLoaded = true
    }

    const nodeList = document.querySelectorAll(contentItemSelector)
    const items = []
    for (let i = 0; i < nodeList.length; i++) {
      items.push(nodeList[i])
    }

    const readItemInfo = item => {
      const imgUrl = item.querySelector("img")
      const storeName = item.querySelector("h2").innerText
      const address = item.querySelector("div.result-address").innerText
      return { imgUrl, storeName, address }
    }

    const itemsInfo = items.map(item => readItemInfo(item))

    return { numItems: nodeList.length, itemsInfo }
  })

  console.log(seeResult)
  await screenshot(page)({ path: `${screenshotDir}/after.jpeg`, quality: 20 })
  await browser.close()
  timeout.log()
  return "hello"
}

var exports = (module.exports = findStore)

const s = []
const click = async () => {}

s.forEach(async selector => {
  await click(selector)
})

const a = async () => {
  await setTimout(console.log("b"))
}
a()
console.log("a")

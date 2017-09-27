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

const abc = ["#result-box"]

const c = {
  loginButton: "#accountmanager > a",
  clickLogin: "#fdDlgLogin > div.frame > div.btns.col2.bottom > a.btn.btn-login",
  emailInput: "#Email",
  passInput: "#Password",
  submitButton: "#bt_submit"
}

const findStore = async () => {
  const browser = await puppeteer.launch(config.launch)
  const page = await browser.newPage()
  await page.goto(homepage)
  await page.setViewport({ width: 1200, height: 600 })
  await dismisPopup(page)("#popup-choose-category > ul > li:nth-child(1) > a")
  await screenshot(page)({ path: `before.png` })

  // Have to login, foddy damn crazy
  // A lot of bug happens, when user NOT LOGGINED IN
  const loginButton = await page.$(c.loginButton)
  await loginButton.click()
  await page.waitForSelector(c.clickLogin)

  const clickLogin = await page.$(c.clickLogin)
  await clickLogin.click()
  const redirectToLoginUrl = `window.location.href.includes("id.foody.vn")`
  await page.waitForFunction(redirectToLoginUrl)

  await screenshot(page)({ path: "login-page.jpeg", quality: 20 })

  await page.focus(c.emailInput)
  page.type("hoanganh_25991@yahoo.com.vn")

  await page.focus(c.passInput)
  page.type("wckmaemi")

  const submitBtn = await page.$(c.submitButton)
  await submitBtn.click()
  const redirectToHomePageUrl = `window.location.href=="https://www.foody.vn/#/places"`
  await page.waitForFunction(redirectToHomePageUrl)

  await screenshot(page)({ path: `logged-in.jpeg`, quality: 20 })

  // const startQueue = Promise.resolve(log("Starting await queue..."))
  // await steps.reduce(async (carry, { selector, waitFor }, index) => {
  //   await carry
  //   return clickAndWait(page)({ selector, waitFor }, index)
  // }, startQueue)
  //
  // await page.waitForSelector(resultSelector)
  // await screenshot(page)({ path: `after.png` })
  //
  // const seeResult = await page.evaluate(async () => {
  //   const defer = async waitTime => await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
  //   const forcePageLoadMoreContent = async (waitTime = null) => {
  //     const body = document.body;
  //     const documentCurrHeight = body.clientHeight
  //     window.scrollBy(0, documentCurrHeight);
  //     waitTime = waitTime ? waitTime : 10;
  //     await defer(waitTime)
  //   }
  //
  //   // Wait for items load
  //   await forcePageLoadMoreContent(3)
  //   await forcePageLoadMoreContent(3)
  //   await forcePageLoadMoreContent(3)
  //
  //
  //   const loadMoreButton = document.querySelector("#scrollLoadingPage")
  //
  //   let allItemsLoaded = false;
  //   while(!allItemsLoaded){
  //     loadMoreButton.click();
  //     await forcePageLoadMoreContent(3)
  //     await forcePageLoadMoreContent(3)
  //     await forcePageLoadMoreContent(3)
  //     const bound = loadMoreButton.getBoundingClientRect();
  //     const loadButtonIsHidden = bound.width == 0 && bound.height == 0
  //     if(loadButtonIsHidden)
  //       allItemsLoaded = true;
  //   }
  //
  //   const resultDiv = document.querySelector("#result-box")
  //   const containerDiv = resultDiv.querySelector("div.row-view > div > div")
  //   const contentItems = containerDiv.querySelectorAll("div.row-item filter-result-item")
  //   return {numItems: contentItems.length}
  // })
  //
  // console.log(seeResult)
  await browser.close()
  timeout.log()
  return "hello"
}

var exports = (module.exports = findStore)

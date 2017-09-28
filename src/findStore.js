const defer = require("./defer")
const logWithInfo = require("./logWithInfo")
const puppeteer = require("puppeteer")
const { puppeteer: config } = require("./config")
const logExactErrMsg = require("./logExactErrMsg")
const { screenshot, dismisPopup, clickAndWait } = require("./pageUtils")

const homepage = "https://www.foody.vn/#/places"
const viewport = { width: 1200, height: 600 }

const steps = [
  { selector: "#searchFormTop > div > a", waitFor: "#fdDlgSearchFilter > div.sf-right" },
  { selector: "#search-filter-dis-4" },
  { selector: "#fdDlgSearchFilter > div.sf-left > ul > li:nth-child(3)", waitFor: "#search-filter-cate-11" },
  { selector: "#search-filter-cate-11" },
  { selector: "#fdDlgSearchFilter > div.sf-bottom > div > a.fd-btn.blue" }
]

const resultSelector =
  "#GalleryPopupApp > div.directory-container > div > div > div > div > div.result-side > div.head-result.d_resultfilter"

const screenshotDir = "screenshot"

const contentItemSelector = "#result-box > div.row-view > div > div > div"

const loginDescription = [
  {
    title: `Dismiss popup`,
    click: `#popup-choose-category > ul > li:nth-child(1) > a`
  },
  {
    title: `Wait for popup disappear`,
    waitForFunction: `document.querySelector("#popup-choose-category > ul > li:nth-child(1) > a").offsetParent === null`
  },
  {
    title: `Login`,
    actions: [
      {
        title: `Click 'Đăng nhập'`,
        click: `#accountmanager > a`
      },
      // {
      //   title: `Wait for see 'Đăng nhập' button on popup`,
      //   waitForSelector: `#fdDlgLogin > div.frame > div.btns.col2.bottom > a.btn.btn-login`,
      // },
      {
        title: `Click 'Đăng nhập' on popup`,
        click: `#fdDlgLogin > div.frame > div.btns.col2.bottom > a.btn.btn-login`
      },
      {
        title: `Wait for login page loaded`,
        waitForFunction: `window.location.href.includes("https://id.foody.vn")`
      },
      {
        title: `Type in email`,
        actions: [
          {
            title: `Focus on email input`,
            focus: `#Email`
          },
          {
            title: `Type email: hoanganh_25991@yahoo.com.vn`,
            type: `hoanganh_25991@yahoo.com.vn`
          }
        ]
      },
      {
        title: `Type in password`,
        actions: [
          {
            title: `Focus on password input`,
            focus: `#Password`
          },
          {
            title: `Type password: wckmaemi`,
            type: `wckmaemi`
          }
        ]
      },
      {
        title: `Click Đăng nhập, to submit`,
        click: `#bt_submit`
      },
      {
        title: `Wait for go back to homepage`,
        waitForFunction: `window.location.href==="https://www.foody.vn/#/places"`
      }
    ]
  }
]

const finishAwaitList = arr => async callback => {
  await arr.reduce(async (carry, awaitItem) => {
    await carry
    return callback(awaitItem)
  }, console.log("Finish awaitList"))
}

const doAction = (page, subLevel = 0) => async action => {
  const { title } = action
  logWithInfo(title, subLevel)
  const { actions } = action

  const hasChildActions = Boolean(actions)
  if (hasChildActions) {
    const currSubLevel = subLevel + 1
    await finishAwaitList(actions)(doAction(page, currSubLevel))
    return
  }

  const actionName = Object.keys(action).filter(actionName => actionName !== "title")[0]
  const param = action[actionName]
  await page[actionName](param)
  const imgName = title.replace(/[^a-zA-Z\s]/g, "")
  await page.screenshot({ path: `${imgName}.png` })
}

const readDescription = page => async description => {
  await finishAwaitList(description)(doAction(page))
}

const findStore = async () => {
  const browser = await puppeteer.launch(config.launch)
  const page = await browser.newPage()
  await page.goto(homepage)
  await page.setViewport(viewport)
  await page.setRequestInterceptionEnabled(true)
  const networkRequest = []
  page.on("request", interceptedRequest => {
    networkRequest.push(interceptedRequest.url)
    if (interceptedRequest.url.endsWith(".png") || interceptedRequest.url.endsWith(".jpg")) interceptedRequest.abort()
    else interceptedRequest.continue()
  })

  await readDescription(page)(loginDescription)

  logWithInfo(`networkRequest.length: ${networkRequest.length}`)
  await screenshot(page)({ path: `${screenshotDir}/after.jpeg`, quality: 20 })
  await browser.close()
  return "hello"
}

var exports = (module.exports = findStore)

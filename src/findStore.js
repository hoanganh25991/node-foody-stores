const defer = require("./defer")
const logWithInfo = require("./logWithInfo")
const puppeteer = require("puppeteer")
const { puppeteer: config } = require("./config")
const logExactErrMsg = require("./logExactErrMsg")
const { screenshot } = require("./pageUtils")

const homepage = "https://www.foody.vn/#/places"
const viewport = { width: 1200, height: 600 }

const screenshotDir = "screenshot"

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
      {
        title: `Wait for see 'Đăng nhập' button on popup`,
        waitForSelector: `#fdDlgLogin > div.frame > div.btns.col2.bottom > a.btn.btn-login`
      },
      {
        title: `Click 'Đăng nhập' on popup`,
        click: `#fdDlgLogin > div.frame > div.btns.col2.bottom > a.btn.btn-login`
      },
      {
        title: `Wait for login page loaded`,
        waitForFunction: `window.location.href.startsWith("https://id.foody.vn")`
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
        waitForFunction: [`window.location.href.startsWith("https://www.foody.vn")`, { timeout: 60 * 1000 }]
      },
      {
        title: `Current location`,
        evaluate: () => window.location.href,
        storeReturnAsKey: "currentLocation"
      }
    ]
  },
  {
    title: `Inject getIdFromSelector for page`,
    exposeFunction: [
      "getIdFromSelector",
      selector => {
        const idStrs = selector.match(/\d+/gi)
        if (!idStrs) throw new Error(`Cant find id from selector: ${selector}`)
        //Get the first one only
        return Number(idStrs[0])
      }
    ]
  },
  {
    title: `Store available location`,
    actions: [
      {
        title: `Open filter 'Bộ lọc'`,
        click: `#searchFormTop > div > a`
      },
      {
        title: `Wait for filter 'Bộ lọc' load locations 'Khu vực'`,
        waitForSelector: ["#fdDlgSearchFilter > div.sf-right", { timeout: 60 * 1000 }]
      },
      {
        title: `Evaluate`,
        evaluate: () => {
          const inputNodeList = document.querySelectorAll(
            "#fdDlgSearchFilter > div.sf-right > div:nth-child(2) > ul > li > input"
          )
          const inputList = []
          for (let i = 0; i < inputNodeList.length; i++) {
            inputList.push(inputNodeList[i])
          }
          const availableLocations = inputList.map(inputElement => {
            const selector = inputElement.id
            const labelElement = inputElement.nextElementSibling
            const displayName = labelElement.innerText
            //noinspection JSUnresolvedFunction
            const locationId = 1
            return { selector, displayName, locationId }
          })
          return availableLocations
        },
        storeReturnAsKey: "availableLocations"
      }
    ]
  },
  {
    title: `Store available categories`,
    actions: [
      {
        title: `Open filter 'Bộ lọc' for categories 'Phân loại'`,
        click: `#fdDlgSearchFilter > div.sf-left > ul > li:nth-child(3)`
      },
      {
        title: `Wait for filter 'Bộ lọc' load categories 'Phân loại'`,
        waitForFunction: `setTimeout(()=>{document.querySelector("#fdDlgSearchFilter > div.sf-left > ul > li:nth-child(3)").getAttribute("class")==="active"}, 500)`
      },
      {
        title: `Evaluate`,
        evaluate: () => {
          const inputNodeList = document.querySelectorAll(
            "#fdDlgSearchFilter > div.sf-right > div:nth-child(1) > ul > li > input"
          )
          const inputList = []
          for (let i = 0; i < inputNodeList.length; i++) {
            inputList.push(inputNodeList[i])
          }
          const a = window.getIdFromSelector("adfasdf-2")
          console.log(a)
          const availableLocations = inputList.map(inputElement => {
            const selector = inputElement.id
            const labelElement = inputElement.nextElementSibling
            const displayName = labelElement.innerText
            //noinspection JSUnresolvedFunction
            const categoryId = 1
            return { selector, displayName, categoryId }
          })
          return availableLocations
        },
        storeReturnAsKey: "availableCategories"
      }
    ]
  }
]

// const steps = [
//   { selector: "#searchFormTop > div > a", waitFor: "#fdDlgSearchFilter > div.sf-right" },
//   { selector: "#search-filter-dis-4" },
//   { selector: "#fdDlgSearchFilter > div.sf-left > ul > li:nth-child(3)", waitFor: "#search-filter-cate-11" },
//   { selector: "#search-filter-cate-11" },
//   { selector: "#fdDlgSearchFilter > div.sf-bottom > div > a.fd-btn.blue" }
// ]

const NetworkManager = page => {
  const requestUrlList = []
  const requestList = []
  page.on("request", interceptedRequest => {
    requestList.push(interceptedRequest)
    requestUrlList.push(interceptedRequest.url)
    if (interceptedRequest.url.endsWith(".jpg") || interceptedRequest.url.endsWith(".jpg")) interceptedRequest.abort()
    else interceptedRequest.continue()
  })
  page.on("console", msg => console.log(msg))
  return {
    log() {
      logWithInfo(`[NetworkManager] Summary: ${requestUrlList.length} requets`)
    },
    get() {
      return requestUrlList
    }
  }
}

const sampleAwaitAction = {
  title: "Sameple await action",
  actions: [],
  // click: ["arg1", "arg2"],
  storeReturnAsKey: "sampleAwaitAction",
  screenshot: true
}

const getReservedKeyInAwaitAction = () => Object.keys(sampleAwaitAction)

const getActionName = awaitAction => {
  const keys = Object.keys(awaitAction)
  const reservedKeys = getReservedKeyInAwaitAction()
  const actionName = keys.filter(key => !reservedKeys.includes(key))[0]
  if (!actionName) throw new Error("Cant find actionName")
  return actionName
}

const queueAwaitList = awaitList => lastReturn => async callback => {
  return await awaitList.reduce(async (carry, awaitAction) => {
    const lastReturn = await carry
    return callback(lastReturn)(awaitAction)
  }, lastReturn)
}

const enhancePage = page => {
  if (page.runFunction) return
  page.runFunction = callback => callback()
}

const runPageAction = (page, subLevel = 0) => lastReturn => async awaitAction => {
  enhancePage(page)
  const { title, actions: awaitList } = awaitAction
  logWithInfo(title, subLevel)

  // Has child actions, self call to run it
  const hasChildActions = Boolean(awaitList)
  if (hasChildActions) {
    const currSubLevel = subLevel + 1
    const callback = runPageAction(page, currSubLevel)
    return await queueAwaitList(awaitList)(lastReturn)(callback)
  }

  // Run page action
  const actionName = getActionName(awaitAction)
  const params = awaitAction[actionName]
  const args = Array.isArray(params) ? params : [params]
  // const result = await page[actionName](...args)
  let result
  try {
    result = await page[actionName](...args)
  } catch (err) {
    logExactErrMsg(err)
  }

  // Should take screenshot
  const { screenshot = true } = awaitAction
  if (screenshot) {
    const imgName = title.replace(/[^a-zA-Z]/g, "")
    await page.screenshot({ path: `${screenshotDir}/${imgName}.jpg`, qualtity: 10 })
  }

  // Should store return
  let actionReturn = {}
  const { storeReturnAsKey } = awaitAction
  if (storeReturnAsKey) {
    actionReturn = { [storeReturnAsKey]: result }
  }

  // Merge return
  const nextReturn = Object.assign(lastReturn, actionReturn)
  return nextReturn
}

const readDescription = page => async awaitListDescription => {
  const storeReturn = {}
  await queueAwaitList(awaitListDescription)(storeReturn)(runPageAction(page))
  logWithInfo(["storeReturn", storeReturn])
  // const fs = require("fs")
  // fs.writeFileSync("abc.log", JSON.stringify(storeReturn))
  return storeReturn
}

const findStore = async () => {
  const browser = await puppeteer.launch(config.launch)
  const page = await browser.newPage()
  await page.goto(homepage)
  await page.setViewport(viewport)
  await page.setRequestInterceptionEnabled(true)
  const networKMangeer = NetworkManager(page)

  await readDescription(page)(loginDescription)

  networKMangeer.log()
  await screenshot(page)({ path: `${screenshotDir}/after.jpg`, quality: 20 })
  await browser.close()
  return "hello"
}

var exports = (module.exports = findStore)

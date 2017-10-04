const defer = require("./defer")
const logWithInfo = require("./logWithInfo")
const puppeteer = require("puppeteer")
const { puppeteer: config } = require("./config")
const logExactErrMsg = require("./logExactErrMsg")
const { screenshot } = require("./pageUtils")
const homepage = "https://www.foody.vn/ho-chi-minh#/places"
const viewport = { width: 1200, height: 600 }
const screenshotDir = "screenshot"
const jsonLogDir = "tmp"

const NetworkManager = page => {
  const requestUrlList = []
  const requestList = []
  page.on("request", interceptedRequest => {
    requestList.push(interceptedRequest)
    requestUrlList.push(interceptedRequest.url)
    if (interceptedRequest.url.endsWith(".jpg") || interceptedRequest.url.endsWith(".jpg")) interceptedRequest.abort()
    else interceptedRequest.continue()
  })
  // page.on("console", msg => console.log(msg))
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

  // Has child actions, self call to callApiUrl it
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
    // Always defer 0.5s to wait for execution
  } catch (err) {
    logExactErrMsg(err)
  }

  await defer(0.5)

  // Should take screenshot
  const { screenshot } = awaitAction
  if (screenshot) {
    let imgName = title.replace(/[^a-zA-Z]/g, "")
    if (typeof screenshot === "object" && screenshot.imgName) imgName = screenshot.imgName
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
  // const time = new Date().getTime()
  // fs.writeFileSync(`${time}.json`, JSON.stringify(storeReturn))
  return storeReturn
}

const loginDescription = [
  {
    title: `Dismiss popup`,
    actions: [
      {
        title: `Click to 'Khám phá' to hide popup`,
        click: `#popup-choose-category > ul > li:nth-child(1) > a`
      },
      {
        title: `Wait for popup disappear`,
        waitForFunction: `document.querySelector("#popup-choose-category > ul > li:nth-child(1) > a").offsetParent === null`
      }
    ]
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
        evaluate: async () => {
          const inputNodeList = document.querySelectorAll(
            "#fdDlgSearchFilter > div.sf-right > div:nth-child(2) > ul > li > input"
          )
          const inputList = []
          for (let i = 0; i < inputNodeList.length; i++) {
            inputList.push(inputNodeList[i])
          }
          const availableLocations = await inputList.reduce(async (carry, inputElement) => {
            const lastCarry = await carry
            const selector = `#${inputElement.id}`
            const labelElement = inputElement.nextElementSibling
            const displayName = labelElement.innerText
            //noinspection JSUnresolvedFunction
            const id = await window.getIdFromSelector(selector)
            return [...lastCarry, { selector, displayName, id }]
          }, [])
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
        evaluate: async () => {
          const inputNodeList = document.querySelectorAll(
            "#fdDlgSearchFilter > div.sf-right > div:nth-child(1) > ul > li > input"
          )
          const inputList = []
          for (let i = 0; i < inputNodeList.length; i++) {
            inputList.push(inputNodeList[i])
          }
          const availableCategories = await inputList.reduce(async (carry, inputElement) => {
            const lastCarry = await carry
            const selector = `#${inputElement.id}`
            const labelElement = inputElement.nextElementSibling
            const displayName = labelElement.innerText
            //noinspection JSUnresolvedFunction
            const id = await window.getIdFromSelector(selector)
            return [...lastCarry, { selector, displayName, id }]
          }, [])
          return availableCategories
        },
        storeReturnAsKey: "availableCategories"
      }
    ]
  }
]

const generateGetUrlApiDescription = location => category => {
  const { selector: locationSelector, displayName: locationName, id: locationId } = location
  const { selector: categorySelector, displayName: categoryName, id: categoryId } = category
  console.log("\x1b[36m%s\x1b[0m", `Filter Description for ${locationName} > ${categoryName}`)
  return [
    // {
    //   title: `Go to homepage`,
    //   actions: [
    //     {
    //       title: `XXX`,
    //       // goto: [`https://www.foody.vn/ho-chi-minh#/places`, { waitUntil: "networkidle" }],
    //       evaluate: async () => {
    //         window.location.href = "https://www.foody.vn/ho-chi-minh#/places"
    //         // await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve))
    //       },
    //     }
    //   ]
    // },
    {
      title: `Dismiss popup`,
      actions: [
        {
          title: `Click to 'Khám phá' to hide popup`,
          click: `#popup-choose-category > ul > li:nth-child(1) > a`
        },
        {
          title: `Wait for popup disappear`,
          waitForFunction: `document.querySelector("#popup-choose-category > ul > li:nth-child(1) > a").offsetParent === null`
        }
      ]
    },
    {
      title: `Run filter 'Bộ lọc' to get url API`,
      actions: [
        {
          title: `Choose ${locationName}`,
          actions: [
            {
              title: `Open filter 'Bộ lọc'`,
              click: `#searchFormTop > div > a`
            },
            {
              title: `XXXXX`,
              waitForFunction: `document.querySelector("#fdDlgSearchFilter").getAttribute("class")=="fd-search-filter ng-scope"`
            },
            {
              title: `Click ${locationName}`,
              click: `${locationSelector}`
            }
          ]
        },
        {
          title: `Choose ${categoryName}`,
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
              title: `Click ${categoryName}`,
              click: `${categorySelector}`
            }
          ]
        },
        {
          title: `Submit to find out API url`,
          click: `#fdDlgSearchFilter > div.sf-bottom > div > a.fd-btn.blue`
        },
        {
          title: `Wait to see result`,
          waitFor: `#GalleryPopupApp > div.directory-container > div > div > div > div > div.result-side`
          // screenshot: { imgName: `filter-page-for-lc${locationId}${categoryId}` }
        },
        {
          title: `Store api url`,
          evaluate: () => {
            const url = window.location.href
            return { url }
          },
          storeReturnAsKey: `lc${location.id}${category.id}`
        }
      ]
    }
  ]
}

const joinTwoList = list1 => list2 => {
  return list1.reduce((carry, item) => {
    const itemWithList2Item = list2.map(list2Item => [item, list2Item])
    return [...carry, ...itemWithList2Item]
  }, [])
}

const findLocationCategory = async () => {
  const browser = await puppeteer.launch(config.launch)
  const page = await browser.newPage()
  await page.goto(homepage)
  await page.setViewport(viewport)
  await page.setRequestInterceptionEnabled(true)
  const networKMangeer = NetworkManager(page)
  const { availableLocations, availableCategories } = await readDescription(page)(loginDescription)
  networKMangeer.log()
  await screenshot(page)({ path: `${screenshotDir}/after.jpg`, quality: 20 })
  await browser.close()
  return { availableLocations, availableCategories }
}

const findApiUrl = async ({ availableLocations, availableCategories }) => {
  const browser = await puppeteer.launch(config.launch)
  let page = await browser.newPage()
  await page.setViewport(viewport)
  console.log("\x1b[41m%s\x1b[0m: ", "Open new page") //yellow
  await page.setRequestInterceptionEnabled(true)
  const networKManger = NetworkManager(page)

  const run = lastList => async ([location, category]) => {
    await page.goto(homepage)
    const description = generateGetUrlApiDescription(location)(category)
    const url = await readDescription(page)(description)
    const nextList = [...lastList, url]
    storeData("api-list.json")(nextList)
    return nextList
  }

  const shouldCrawlCategoriesName = [
    "Ăn chay",
    "Quán ăn",
    "Quán nhậu",
    "Tiệm bánh",
    "Ăn vặt/vỉa hè",
    "Giao cơm văn phòng"
  ]
  const shouldCrawlCategories = availableCategories.filter(category =>
    shouldCrawlCategoriesName.includes(category.displayName)
  )
  const locationWithCategorys = joinTwoList(availableLocations)(shouldCrawlCategories)

  let count = 0
  const urlList = await locationWithCategorys.reduce(async (carry, item) => {
    const lastList = await carry
    console.log("\x1b[41m%s\x1b[0m: ", `At chunk: ${count}`)
    count++
    return run(lastList)(item)
  }, Promise.resolve([]))

  networKManger.log()
  await page.close()
  await browser.close()

  return urlList
}

const storeData = fileName => data => {
  const fs = require("fs")
  fs.writeFileSync(`${jsonLogDir}/${fileName}`, JSON.stringify(data))
}

const findStore = async () => {
  const { availableLocations, availableCategories } = await findLocationCategory()
  storeData("location-category.json")({ availableLocations, availableCategories })
  const apiUrlList = await findApiUrl({ availableLocations, availableCategories })
  // storeData("api-list.json")(apiUrlList)
  return apiUrlList
}

var exports = (module.exports = findStore)

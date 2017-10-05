const updateToFirebase = require("./updateToFirebase")
const { puppeteer: config } = require("./config")
const puppeteer = require("puppeteer")
const logWithInfo = require("./logWithInfo")
const callFoodyApi = require("./callFoodyApi")
const apiUrlList = require("./api-list.test.json")
//noinspection JSUnresolvedFunction
const urlList = apiUrlList.map(lcXX => {
  const urlObj = Object.values(lcXX)[0]
  const { url } = urlObj
  return url
})

const needKeys = [
  "Address",
  "District",
  "City",
  "Phone",
  "SpecialDesc",
  "TotalReview",
  "TotalView",
  "TotalFavourite",
  "TotalCheckins",
  "AvgRating",
  "AvgRatingOriginal",
  "ReviewUrl",
  "AlbumUrl",
  "Latitude",
  "Longitude",
  "MainCategoryId",
  "PictureCount",
  "DistrictId",
  "DistrictUrl",
  "DeliveryUrl",
  "Location",
  "TotalReviewsFormat",
  "TotalPicturesFormat",
  "TotalSaves",
  "Id",
  "Name",
  "PicturePath",
  "PicturePathLarge",
  "MobilePicturePath",
  "DetailUrl"
]

const todayDDMMYYY = () => {
  var today = new Date()
  var dd = today.getDate()
  var mm = today.getMonth() + 1 //January is 0!

  let yyyy = today.getFullYear()
  if (dd < 10) {
    dd = "0" + dd
  }
  if (mm < 10) {
    mm = "0" + mm
  }
  let todayStr = dd + "/" + mm + "/" + yyyy
  return todayStr
}

// www.google-analytics.com
const NetworkManager = async page => {
  await page.setRequestInterceptionEnabled(true)
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

const getPhoneNumber = async storeId => {
  const urlEndpoint = `https://www.foody.vn/__get/Restaurant/RestaurantPhone`
  const fullUrl = `${urlEndpoint}?resId=${storeId}`
  const res = await callFoodyApi(fullUrl, "text")
  //noinspection JSUnresolvedFunction
  const matchPhoneArr = res.match(/<span.+>(.+)<\/span>/i)
  const phoneNumber = matchPhoneArr ? matchPhoneArr[1] : null
  return phoneNumber
}

const getOpenCloseTime = async url => {
  // const res = await callFoodyApi(url)
  // const matchOpenTime = res.match(//i)
  const browser = await puppeteer.launch(config.launch)
  const page = await browser.newPage()
  const net = await NetworkManager(page)
  const fullDetailUrl = url
  console.log("Go to page", fullDetailUrl)
  await page.goto(fullDetailUrl, { timeout: 60 * 1000 })
  console.log("Go to page ok")
  const activeTime = await page.evaluate(async () => {
    const activeTimeSpan = document.querySelector("div.micro-timesopen > span:nth-child(3)")
    const activeTimeStr = activeTimeSpan.innerText
    const activeTime = activeTimeStr.match(/(\d{2}:\d{2})/gi)

    // const contactElm = document.querySelector("#show-phone-number")
    // contactElm.click()

    return activeTime
  })
  net.log()
  return activeTime
}

const readOne = lastStores => page => async url => {
  console.log("\x1b[41m%s\x1b[0m: ", `Crawling stores at main url: ${url}`)
  let count = 1
  let stillHasStores = true
  let stores = []
  do {
    const urlWithPageQuery = `${url}&page=${count}`
    count++
    const res = await callFoodyApi(urlWithPageQuery)
    const { searchUrl, searchItems: searchStores } = res

    logWithInfo(`Searching...`)
    logWithInfo(`Search url: ${searchUrl}`, 1)
    logWithInfo(`Search find: ${searchStores.length} stores`, 1)

    if (!searchStores.length) stillHasStores = false

    const storesWithNeedInfo = await searchStores.reduce(async (carry, originStore) => {
      const lastStoreList = await carry
      const store = needKeys.reduce((carry, key) => {
        const myKey = key.charAt(0).toLocaleLowerCase() + key.substring(1)
        carry[myKey] = originStore[key]
        return carry
      }, {})
      const { id } = store
      const reviewUrl = `https://www.foody.vn/__get/Review/ResLoadMore?ResId=${id}&isLatest=false&Count=1`
      const res = await callFoodyApi(reviewUrl)
      const { Items: reviews } = res
      let createdDate = todayDDMMYYY()
      const firstReviews = reviews[0]
      if (firstReviews) {
        const { CreatedOnTimeDiff } = firstReviews
        createdDate = CreatedOnTimeDiff
      }
      store["createdDate"] = createdDate
      const { detailUrl } = store
      const fullDetailUrl = `https://www.foody.vn${detailUrl}`
      // await page.goto(fullDetailUrl)
      // const activeTime = await page.evaluate(async () => {
      //   const activeTimeSpan = document.querySelector("div.micro-timesopen > span:nth-child(3)")
      //   const activeTimeStr = activeTimeSpan.innerText
      //   const activeTime = activeTimeStr.match(/(\d{2}:\d{2})/gi)
      //
      //   // const contactElm = document.querySelector("#show-phone-number")
      //   // contactElm.click()
      //
      //   return activeTime
      // })
      // const [openingAt, closedAt] = activeTime
      // Object.assign(store, {openingAt, closedAt})
      return [...lastStoreList, store]
    }, [])

    stores = [...stores, ...storesWithNeedInfo]
  } while (stillHasStores)
  // console.log(stores, stores.length)
  const next = [...lastStores, ...stores]
  return next
}

// readOne(urlList[0])
/*
 {
 "seoData": {
 "MetaTitle": "Địa điểm Ăn vặt/vỉa hè tại Quận 2, TP. HCM",
 "MetaKeywords": null,
 "MetaDescription": "Danh sách  hơn 51 địa điểm Ăn vặt/vỉa hè tại Quận 2, TP. HCM. Foody.vn là website #1 tại VN về tìm kiếm địa điểm, có hàng ngàn bình luận, hình ảnh"
 },
 "searchItems": [],
 "searchUrl": "/ho-chi-minh/an-vat-via-he-tai-quan-2?c=an-vat-via-he&categorygroup=food",
 "totalResult": 51,
 "totalSubItems": 2
 }
 */

const run = async () => {
  // const browser = await puppeteer.launch(config.launch)
  // const page = await browser.newPage()
  // const stores = await urlList.reduce(async (carry, url) => {
  //   const lastStores = await carry
  //   return readOne(lastStores)(page)(url)
  // }, [])
  //
  // await browser.close()
  // console.log(stores.length)
  // console.log(stores[0])
  // console.log("\x1b[41m%s\x1b[0m: ", `Update stores to firebase`)
  // const mainBranch = "nodeFoodyStores"
  // const storesBranch = "stores"
  // const storeIndexKey = "id"
  // await updateToFirebase(mainBranch)(storesBranch)(storeIndexKey)(stores)
  // const phoneNumber = await getPhoneNumber(203958)
  const activeTime = await getOpenCloseTime("https://www.foody.vn/ho-chi-minh/khoai-mon-ngon-nha-trang")
  console.log(activeTime)
  process.exit()
}

run()

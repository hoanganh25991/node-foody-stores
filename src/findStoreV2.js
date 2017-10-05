const updateToFirebase = require("./updateToFirebase")
const { puppeteer: config } = require("./config")
const puppeteer = require("puppeteer")
const { logWithInfo } = require("./log")

const { todayDDMMYYY, urlList } = require("./utils")
const { needStoreKeys } = require("./config")
const { callFoodyApi, getOpeningHours, getPhoneNumber } = require("./foody-api")
const { TinyPage } = require("./page")

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
      const store = needStoreKeys.reduce((carry, key) => {
        const myKey = key.charAt(0).toLocaleLowerCase() + key.substring(1)
        carry[myKey] = originStore[key]
        return carry
      }, {})
      const { id } = store

      store["createdDate"] = createdDate
      const { detailUrl } = store
      const openingHours = await getOpeningHours(detailUrl)
      const [openingAt, closedAt] = openingHours
      Object.assign(store, { openingAt, closedAt })
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

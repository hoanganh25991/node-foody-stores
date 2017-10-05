const updateToFirebase = require("./updateToFirebase")
const { puppeteer: config } = require("./config")
const puppeteer = require("puppeteer")
const { logWithInfo } = require("./log")

const { todayDDMMYYY, urlList } = require("./utils")
const { needStoreKeys } = require("./config")
const { callFoodyApi, getOpeningHours, getPhoneNumber, getStoreCreatedDate } = require("./foody-api")
const { TinyPage } = require("./page")

const mainBranch = "nodeFoodyStores"
const storesBranch = "stores"
const storeIndexKey = "id"

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
const readOne = lastSummaryTotal => page => async urlEndpoint => {
  console.log("\x1b[41m%s\x1b[0m: ", `Crawling stores at main url: ${urlEndpoint}`)
  let page = 1
  let stillHasStores = true
  let stores = []

  do {
    page++
    const urlWithPageQuery = `${urlEndpoint}&page=${page}`
    logWithInfo(`Searching page ${page}...`)

    const res = await callFoodyApi(urlWithPageQuery)
    const { searchItems: searchStores } = res
    logWithInfo(`Search find: ${searchStores.length} stores`, 1)

    if (!searchStores.length) stillHasStores = false

    const storesWithNeedInfo = await searchStores.reduce(async (carry, originStore) => {
      const lastStoreList = await carry

      //noinspection JSUnresolvedFunction
      const store = needStoreKeys.reduce((carry, key) => {
        const myKey = key.charAt(0).toLocaleLowerCase() + key.substring(1)
        carry[myKey] = originStore[key]
        return carry
      }, {})

      const createdDate = await getStoreCreatedDate(store.id)
      Object.assign(store, { createdDate })
      //noinspection JSUnresolvedVariable
      const openingHours = await getOpeningHours(store.detailUrl)
      const [openingAt, closedAt] = openingHours
      Object.assign(store, { openingAt, closedAt })

      return [...lastStoreList, store]
    }, [])

    stores = [...stores, ...storesWithNeedInfo]
  } while (stillHasStores)

  await updateToFirebase(mainBranch)(storesBranch)(storeIndexKey)(stores)

  const nextSummaryTotal = lastSummaryTotal + stores.length
  return nextSummaryTotal
}

const run = async () => {
  const page = await TinyPage()
  //noinspection JSUnresolvedFunction
  const totalStoreFound = await urlList.reduce(async (carry, urlEndpoint) => {
    const lastStores = await carry
    return readOne(lastStores)(page)(urlEndpoint)
  }, 0)

  logWithInfo(`Find ${totalStoreFound} stores`)

  process.exit()
}

run()

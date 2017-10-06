const updateToFirebase = require("./firebase/updateToFirebase")
const { logDebug, logExactErrMsg } = require("./log")
const { urlList } = require("./utils")
const { needStoreKeys, firebaseBranch } = require("./_config")
const { callFoodyApi, getOpeningHours, getPhoneNumber, getStoreCreatedDate } = require("./foody-api")
const { TinyPage } = require("./page")

const { mainBranch, storesBranch, storeIndexKey } = firebaseBranch

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
const readOne = lastSummaryTotal => async urlEndpoint => {
  logDebug(`Crawling stores at MAIN url`, 0, "\x1b[41m%s\x1b[0m")
  logDebug(urlEndpoint)
  let pageCount = 0
  let stillHasStores = true
  let stores = []

  do {
    pageCount++
    const urlWithPageQuery = `${urlEndpoint}&page=${pageCount}&append=true`
    logDebug(`Searching page ${pageCount}...`, 0, "\x1b[36m%s\x1b[0m")

    const res = await callFoodyApi(urlWithPageQuery)
    const { searchItems: searchStores } = res
    logDebug(`Search find: ${searchStores.length} stores`, 1)

    if (!searchStores.length) stillHasStores = false

    const storesWithNeedInfo = await searchStores.reduce(async (carry, originStore) => {
      const lastStoreList = await carry
      logDebug(`Rebuild store data, storeId: ${originStore.Id}`, 1)

      logDebug(`Change store key`, 2)
      //noinspection JSUnresolvedFunction
      const store = needStoreKeys.reduce((carry, key) => {
        const myKey = key.charAt(0).toLocaleLowerCase() + key.substring(1)
        carry[myKey] = originStore[key]
        return carry
      }, {})

      logDebug(`Find store 'createdDate'`, 2)
      const createdDate = await getStoreCreatedDate(store.id)
      Object.assign(store, { createdDate })

      logDebug(`Find store 'phoneNumber'`, 2)
      const phoneNumber = await getPhoneNumber(store.id)
      Object.assign(store, { phoneNumber })

      logDebug(`Find store 'openingHours'`, 2)
      //noinspection JSUnresolvedVariable
      const openingHours = await getOpeningHours(store.detailUrl)
      const [openingAt, closedAt] = openingHours
      Object.assign(store, { openingAt, closedAt })

      logDebug(`Complete rebuild store`, 2)

      logDebug(`Update store to firebase`, 1)
      await updateToFirebase(mainBranch)(storesBranch)(storeIndexKey)([store])

      return [...lastStoreList, store]
    }, [])

    stores = [...stores, ...storesWithNeedInfo]
  } while (stillHasStores)

  // await updateToFirebase(mainBranch)(storesBranch)(storeIndexKey)(stores)

  const nextSummaryTotal = lastSummaryTotal + stores.length
  return nextSummaryTotal
}

const findStore = async () => {
  //noinspection JSUnresolvedFunction
  const totalStoreFound = await urlList.reduce(async (carry, urlEndpoint) => {
    const lastStores = await carry
    return readOne(lastStores)(urlEndpoint)
  }, 0)
  logDebug(`Find ${totalStoreFound} stores`)
}

// (async () => {
//   try {
//     console.error = () => {}
//     await findStore()
//     await TinyPage.closeBrowser()
//   } catch (err) {
//     logExactErrMsg(err)
//   } finally {
//     // Auto re callApiUrl
//     // setTimeout(crawling, 6000)
//     logDebug("==============COMPLETE CRAWLING FOODY==============")
//     process.exit()
//   }
// })()

module.exports = findStore

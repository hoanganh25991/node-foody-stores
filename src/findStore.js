const { logDebug: _, logExactErrMsg } = require("./log")
const { urlList, redo } = require("./utils")
const { needStoreKeys, firebaseBranch: { mainBranch, storesBranch, storeIndexKey } } = require("./config")
const { callFoodyApi, getOpeningHours, getPhoneNumber, getStoreCreatedDate } = require("./foody-api")
const updateToFirebase = require("./firebase/updateToFirebase")
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
const getFoodyStores = async urlEndpoint => {
  _(`Search stores at url: ${urlEndpoint}`)
  const { searchItems: foodyStores } = await callFoodyApi(urlEndpoint)
  _(`Found: ${foodyStores.length} stores`)
  return foodyStores
}

// _(`Searching page ${redoCount}...`, 0, "\x1b[36m%s\x1b[0m")

const rebuildStore = async (originStore, needStoreKeys) => {
  // _(`Rebuild store data, storeId: ${originStore.Id}`, 1)
  // _(`Change store key`, 2)
  //noinspection JSUnresolvedFunction
  const store = needStoreKeys.reduce((carry, key) => {
    const myKey = key.charAt(0).toLocaleLowerCase() + key.substring(1)
    carry[myKey] = originStore[key]
    return carry
  }, {})

  const { id: storeId, detailUrl: storeDetailUrl } = store

  // _(`Find store 'createdDate'`, 2)
  const createdDate = await getStoreCreatedDate(storeId)
  Object.assign(store, { createdDate })

  // _(`Find store 'phoneNumber'`, 2)
  const phoneNumber = await getPhoneNumber(store.id)
  Object.assign(store, { phoneNumber })

  // _(`Find store 'openingHours'`, 2)
  //noinspection JSUnresolvedVariable
  const [openingAt, closedAt] = await getOpeningHours(storeDetailUrl)
  Object.assign(store, { openingAt, closedAt })

  // _(`Complete rebuild store`, 2)
  // _(`Update store to firebase`, 1)
  await updateToFirebase(mainBranch)(storesBranch)(storeIndexKey)([store])

  return store
}

const saveStore = urlEndpoint => async (redoCount, lastResult, finish) => {
  const urlWithPageQuery = `${urlEndpoint}&page=${redoCount}&append=true`
  const foodyStores = await getFoodyStores(urlWithPageQuery)

  const shouldBreak = foodyStores.length == 0
  if (shouldBreak) {
    finish()
    return
  }

  const storesWithNeedInfo = await foodyStores.reduce(async (carry, originStore) => {
    const lastStoreList = await carry
    const store = rebuildStore(originStore, needStoreKeys)
    return [...lastStoreList, store]
  }, [])

  return storesWithNeedInfo
}

const readOne = lastSummaryTotal => async urlEndpoint => {
  // _(`Crawling stores at MAIN url`, 0, "\x1b[41m%s\x1b[0m")
  // _(urlEndpoint)
  const stores = redo(saveStore(urlEndpoint))
  //noinspection JSUnresolvedVariable
  const nextSummaryTotal = lastSummaryTotal + stores.length
  return nextSummaryTotal
}

const findStore = async () => {
  //noinspection JSUnresolvedFunction
  const totalStoreFound = await urlList.reduce(async (carry, urlEndpoint) => {
    const lastStores = await carry
    return readOne(lastStores)(urlEndpoint)
  }, 0)
  _(`Find ${totalStoreFound} stores`)
}

;(async () => {
  try {
    console.error = () => {}
    await findStore()
  } catch (err) {
    logExactErrMsg(err)
  } finally {
    _("==============COMPLETE CRAWLING FOODY==============")
    process.exit()
  }
})()

module.exports = findStore

const { logDebug: _, logExactErrMsg } = require("./log")
const { urlList, redo, sendNotification, hideErrorLog } = require("./utils")
const { needStoreKeys, firebaseBranch: { mainBranch, storesBranch, storeIndexKey } } = require("./config")
const { getFoodyStores, getOpeningHours, getPhoneNumber, getStoreCreatedDate } = require("./foody-api")
const updateToFirebase = require("./firebase/updateToFirebase")

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

const saveStores = urlEndpoint => async (redoCount, lastResult, finish) => {
  const pageCount = redoCount + 1
  const urlWithPageQuery = `${urlEndpoint}&page=${pageCount}&append=true`

  const foodyStores = await getFoodyStores(urlWithPageQuery)

  const shouldBreak = foodyStores.length == 0
  if (shouldBreak) {
    finish()
    return lastResult
  }

  const storesWithNeedInfo = await foodyStores.reduce(async (carry, originStore) => {
    const lastStoreList = await carry
    const store = rebuildStore(originStore, needStoreKeys)
    return [...lastStoreList, store]
  }, [])

  lastResult = lastResult ? lastResult : []
  return [...lastResult, ...storesWithNeedInfo]
}

const crawlingStoresFromApiUrl = lastTotal => async urlEndpoint => {
  // _(`Crawling stores at MAIN url`, 0, "\x1b[41m%s\x1b[0m")
  // _(urlEndpoint)
  const stores = await redo(saveStores(urlEndpoint))
  //noinspection JSUnresolvedVariable
  const nextSummaryTotal = lastTotal + stores.length
  return nextSummaryTotal
}

const findStore = async () => {
  //noinspection JSUnresolvedFunction
  const totalStoreFound = await urlList.reduce(async (carry, urlEndpoint) => {
    const lastTotal = await carry
    return crawlingStoresFromApiUrl(lastTotal)(urlEndpoint)
  }, 0)
  _(`Find ${totalStoreFound} stores`)
}
;(async () => {
  try {
    hideErrorLog()
    await findStore()
  } catch (err) {
    logExactErrMsg(err)
  } finally {
    _("==============COMPLETE CRAWLING FOODY==============")
    await sendNotification("Complete", { headings: { en: "Crawling Foody" } })
    process.exit()
  }
})()

module.exports = findStore

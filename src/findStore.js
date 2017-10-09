const { logDebug: _, logErr, logAwait } = require("./log")
const { urlList, redo, sendNotification, hideErrorLog } = require("./utils")
const config = require("./config")
const foodyApi = require("./foody-api")
const updateToFirebase = require("./firebase/updateToFirebase")

const { needStoreKeys, firebaseBranch: { mainBranch, storesBranch, storeIndexKey } } = config
const { getFoodyStores, getOpeningHours, getPhoneNumber, getStoreCreatedDate } = foodyApi

// _(`Searching page ${redoCount}...`, 0, "\x1b[36m%s\x1b[0m")

const rebuildStore = async (originStore, needStoreKeys) => {
  const logLevel = _(1)(`Rebuild store data, storeId: ${originStore.Id}`)

  _(1, { logLevel })(`Update store key`)
  //noinspection JSUnresolvedFunction
  const store = needStoreKeys.reduce((carry, key) => {
    const myKey = key.charAt(0).toLocaleLowerCase() + key.substring(1)
    carry[myKey] = originStore[key]
    return carry
  }, {})

  const { id: storeId, detailUrl: storeDetailUrl } = store

  _(1, { logLevel })(`Find 'createdDate'`)
  const createdDate = await getStoreCreatedDate(storeId)
  Object.assign(store, { createdDate })

  _(1, { logLevel })(`Find 'phoneNumber'`)
  const phoneNumber = await getPhoneNumber(store.id)
  Object.assign(store, { phoneNumber })

  _(1, { logLevel })(`Find 'openingHours'`)
  //noinspection JSUnresolvedVariable
  const [openingAt, closedAt] = await getOpeningHours(storeDetailUrl)
  Object.assign(store, { openingAt, closedAt })

  _(1, { logLevel })(`Update to firebase`)
  await updateToFirebase(mainBranch)(storesBranch)(storeIndexKey)([store])

  return store
}

const crawlingStores = urlEndpoint => async (redoCount, lastResult, finish) => {
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
  const stores = await redo(crawlingStores(urlEndpoint))
  //noinspection JSUnresolvedVariable
  const nextSummaryTotal = lastTotal + stores.length
  return nextSummaryTotal
}

const findStores = async () => {
  const logLevel = _()(`Find stores`)
  //noinspection JSUnresolvedFunction
  const totalStoreFound = await urlList.reduce(async (carry, urlEndpoint) => {
    const lastTotal = await carry
    return crawlingStoresFromApiUrl(lastTotal)(urlEndpoint)
  }, 0)

  _(0, { logLevel })(`Summary: Find ${totalStoreFound} stores`)
}

// Run module
;(async () => {
  try {
    hideErrorLog()
    // await findStores()
    await logAwait(findStores, null, "Find store")
  } catch (err) {
    logErr(err)
  } finally {
    _("==============COMPLETE CRAWLING FOODY==============")
    // await sendNotification("Complete", { headings: { en: "Crawling Foody" } })
    process.exit()
  }
})()

module.exports = findStores

const { TinyPage } = require("../page")
const urlEndPoint = "https://www.foody.vn"
const { logDebug } = require("../log")
const { puppeteer: { retryLimit } } = require("../_config")

const getOpeningHours = limit => async storeDetailUrl => {
  let hasError = false
  let retryCount = 0
  do {
    try {
      if (retryCount) logDebug(`[RETRY] ${retryCount} times, at url: ${storeDetailUrl}`, 2, "\x1b[41m%s\x1b[0m")
      const page = await TinyPage()
      const url = `${urlEndPoint}${storeDetailUrl}`
      logDebug(url, 2)
      await page.goto(url, { timeout: 30 * 1000 })
      const activeTime = await page.evaluate(async () => {
        const activeTimeSpan = document.querySelector("div.micro-timesopen > span:nth-child(3)")
        const activeTimeStr = activeTimeSpan.innerText
        const activeTime = activeTimeStr.match(/(\d{2}:\d{2})/gi)
        return activeTime
      })
      page.close()
      return activeTime
    } catch (err) {
      hasError = true
    } finally {
      retryCount++
    }
  } while (hasError && retryCount < limit)

  return [null, null]
}

// (async () => {
//   const aactiveTime = await getOpeningHours("/ho-chi-minh/mato-house-taiwan-healthy-tea")
//   console.log(aactiveTime)
// })()

module.exports = getOpeningHours(retryLimit)

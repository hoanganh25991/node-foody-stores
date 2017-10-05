const { TinyPage } = require("../page")
const urlEndPoint = "https://www.foody.vn"
const { logDebug } = require("../log")
const getOpeningHours = async storeDetailUrl => {
  const page = await TinyPage()
  const url = `${urlEndPoint}${storeDetailUrl}`
  logDebug(url)
  await page.goto(url, { timeout: 60 * 1000 })
  const activeTime = await page.evaluate(async () => {
    const activeTimeSpan = document.querySelector("div.micro-timesopen > span:nth-child(3)")
    const activeTimeStr = activeTimeSpan.innerText
    const activeTime = activeTimeStr.match(/(\d{2}:\d{2})/gi)
    return activeTime
  })
  page.close()
  return activeTime
}

// (async () => {
//   const aactiveTime = await getOpeningHours("/ho-chi-minh/mato-house-taiwan-healthy-tea")
//   console.log(aactiveTime)
// })()

module.exports = getOpeningHours

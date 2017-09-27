const puppeteer = require("puppeteer")
const { puppeteer: config } = require("./config")
const defer = require("./defer")

const dumpFrameTree = (frame, indent) => {
  console.log(indent + frame.url())
  for (let child of frame.childFrames()) dumpFrameTree(child, indent + "  ")
}

const findStore = async homepage => {
  const browser = await puppeteer.launch(config.launch)
  const page = await browser.newPage()
  await page.goto(homepage)
  await defer(3)
  const popup = await page.$("#popup-choose-category > ul > li:nth-child(1) > a")
  await popup.click()
  await defer(1)
  await page.screenshot({ path: `before.png` })

  const filterE = await page.$("#searchFormTop > div > a")
  await filterE.click()

  // await page.waitForSelector("#fdDlgSearchFilter > div.sf-right")
  await defer(10)
  console.log("After click do you see filterContent")

  const s1 = await page.$("#search-filter-dis-4")
  console.log("See s1 or not", Boolean(s1))
  await s1.click()

  await page.screenshot({ path: `after.png` })
  await browser.close()
  return "hello"
}

var exports = (module.exports = findStore)

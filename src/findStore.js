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
  await page.setViewport({
    width: 1200,
    height: 1014
  })
  // page.on('dialog', async dialog => {
  //   console.log(dialog.message());
  //   await dialog.dismiss();
  // });
  const popup = await page.$("#popup-choose-category > ul > li:nth-child(1) > a")
  await popup.click()
  await defer(1)

  await page.screenshot({ path: `before.png` })

  const steps = [
    { selector: "#searchFormTop > div > a", waitFor: "#fdDlgSearchFilter > div.sf-right" },
    { selector: "#search-filter-dis-4" },
    { selector: "#fdDlgSearchFilter > div.sf-left > ul > li:nth-child(3)", waitFor: "#search-filter-cate-11" },
    { selector: "#search-filter-cate-11" },
    { selector: "#fdDlgSearchFilter > div.sf-bottom > div > a.fd-btn.blue", waitFor: "" }
  ]

  // await steps.map(async ({selector, waitFor}, index) => {
  //   const stepButton = await page.$(selector);
  //   await stepButton.click();
  //   await page.waitForSelector(waitFor, {timeout: 5*1000})
  //   await page.screenshot({path: `step${index}.png`})
  // })

  const filterE = await page.$("#searchFormTop > div > a")
  await filterE.click()
  await page.waitForSelector("#fdDlgSearchFilter > div.sf-right")
  console.log("After click do you see filterContent")
  const s1 = await page.$("#search-filter-dis-4")
  console.log("See s1 or not", Boolean(s1))
  await s1.click()

  // let  {selector, waitFor = "body"} = steps[0]
  // const stepButton = await page.$(selector);
  // await stepButton.click();
  // console.log(waitFor)
  // // await page.waitForSelector(waitFor, {timeout: 10*1000})
  // await page.waitForSelector(waitFor)
  // await page.screenshot({path: `step${1}.png`})

  await defer(3)
  await page.screenshot({ path: `after.png` })
  await browser.close()
  return "hello"
}

var exports = (module.exports = findStore)

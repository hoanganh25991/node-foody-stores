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
  page.on("console", (...args) => {
    for (let i = 0; i < args.length; ++i) console.log(`${i}: ${args[i]}`)
  })

  await defer(1)
  // Click to dimiss popup
  const popup = await page.$("#popup-choose-category > ul > li:nth-child(1) > a")
  await popup.click()
  await defer(1)
  await page.screenshot({ path: `before.png` })

  await page.evaluate(() => {
    document.addEventListener("click", () => console.log("adf"))
    console.log("hello")
    return
  })

  // await page.mouse.click(790, 620); // Try to click on selectbox
  await page.mouse.click(265, 600) // Try to click on "Gần tôi"
  // const e = await page.$("#tbt > ul > li:nth-child(2) > a") // Try to click on "Gần tôi"
  // await e.click();

  await defer(6)
  await page.screenshot({ path: `after.png` })
  await browser.close()
  return "hello"
}

var exports = (module.exports = findStore)

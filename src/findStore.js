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
  await defer(3)
  const popup = await page.$("#popup-choose-category > ul > li:nth-child(1) > a")
  await popup.click()
  await defer(1)
  await page.screenshot({ path: `before.png` })

  // Try to click on select box
  const bound = await page.evaluate(() => {
    const selectBox = document.querySelector("#tbt > ul > li:nth-child(7) > select")
    const DOMbound = selectBox.getBoundingClientRect()
    const { x, y, width, height } = DOMbound
    return { x, y, width, height }
  })
  console.log(bound)
  // await page.mouse.click(bound.x + 5, bound.y + 5)
  await page.touchscreen.tap(bound.x + bound.width / 2, bound.y + bound.height / 2)
  await defer(3)

  await page.screenshot({ path: `after.png` })
  await browser.close()
  return "hello"
}

var exports = (module.exports = findStore)

const puppeteer = require("puppeteer")
const devices = require("puppeteer/DeviceDescriptors")
const iPhone = devices["iPhone 6"]

puppeteer
  .launch({
    timeout: 30000,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  })
  .then(async browser => {
    const page = await browser.newPage()
    await page.emulate(iPhone)
    await page.goto("https://www.google.com")
    // other actions...
    const dir = "screenshot"
    await page.screenshot({ path: `${dir}/emulate-iphone.jpeg`, quality: 50 })
    await browser.close()
  })

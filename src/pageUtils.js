var exports = (module.exports = {})

const timeout = require("./timeout")
const logWithInfo = require("./logWithInfo")
const screenshot = page => async options => {
  await page.screenshot(options)
}

const dismisPopup = page => async selector => {
  const popup = await page.$(selector)
  await popup.click()
  /**
   * We check offsetParent as NULL to check if element visible or not
   * @see https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom#21696585
   */
  const cmd = `document.querySelector("${selector}").offsetParent === null`
  await page.waitForFunction(cmd, timeout.store(5))
}

const clickAndWait = page => async ({ selector, waitFor = "body" }, index) => {
  const stepButton = await page.$(selector)
  logWithInfo(`Find ${selector}: ${Boolean(stepButton)}`)
  await stepButton.click()
  await page.waitForSelector(waitFor, timeout.store(5))
  await screenshot(page)({ path: `step${index}.jpeg`, quality: 20 })
}

var exports = (module.exports = {
  screenshot,
  dismisPopup,
  clickAndWait
})

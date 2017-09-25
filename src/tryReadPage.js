const puppeteer = require('puppeteer');
const {puppeteer : config} = require("./config")

const tryReadPage = async (homepage) => {
  const browser = await puppeteer.launch(config.launch);
  const page = await browser.newPage();
  await page.goto(homepage);
  await page.waitForSelector('img', config.waitForSelector)
  const pageInfo = await page.evaluate(async () => {
    const trackWindowInnerHeight = [];
    const forcePageLoadMoreContent = async () => {
      const body = document.body;
      const documentCurrHeight = body.clientHeight
      trackWindowInnerHeight.push(documentCurrHeight)
      window.scrollBy(0, documentCurrHeight);
      const waitTime = 20;
      await new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, waitTime * 1000);
      })
    }
    await forcePageLoadMoreContent()
    await forcePageLoadMoreContent()
    await forcePageLoadMoreContent()
    const provinceDiv = document.getElementById('head-province');
    const province = provinceDiv.getAttribute("ng-init")
    const contentContainerDiv = document.querySelector("div.content-container")
    const contentItemNodeList = contentContainerDiv.querySelectorAll("div.content-item")
    return {province, numContentItems: contentItemNodeList.length, trackWindowInnerHeight}
  }, );
  // Clear browser before out
  await browser.close()
  // Return
  return pageInfo
};

var exports = module.exports = tryReadPage



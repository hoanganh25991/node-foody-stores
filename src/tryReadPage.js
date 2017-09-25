const puppeteer = require('puppeteer');
const {puppeteer : config} = require("./config")

const tryReadPage = async (homepage) => {
  const browser = await puppeteer.launch(config.launch);
  const page = await browser.newPage();
  await page.goto(homepage);
  await page.waitForSelector('img', config.waitForSelector)



  const pageInfo = await page.evaluate(async () => {
    const forcePageLoadMoreContent = async () => {
      window.scrollBy(0, window.innerHeight);
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
    return {province, numContentItems: contentItemNodeList.length}
  }, );
  // Clear browser before out
  await browser.close()
  // Return
  return pageInfo
};

var exports = module.exports = tryReadPage



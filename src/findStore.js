const puppeteer = require('puppeteer');
const {puppeteer : config} = require("./config")
const defer = require("./defer");

const scrollToEnd = async (window) => {
  const currPageHeight =  window.document.body.clientHeight;
  window.scrollBy(0, currPageHeight);
  await defer(10)
}

const forcePageLoadMoreContent = async (repeatTime, window) => {
  const loop = Array(repeatTime).map(_ => scrollToEnd(window))
  await loop
};

const findStore = async (homepage) => {
  const browser = await puppeteer.launch(config.launch);
  const page = await browser.newPage();
  await page.goto(homepage);
  const pageInfo = await page.evaluate(async () => {
    await forcePageLoadMoreContent(3, window)
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

var exports = module.exports = findStore



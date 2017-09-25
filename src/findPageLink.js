const puppeteer = require('puppeteer');
const {puppeteer : config} = require("./config")

const parseLinkList = (link) => {
  const pattern = /\/page\/\d+/gi;
  const pageXMatch = link.match(pattern)
  const pageX = pageXMatch[0];
  const restUrl = link.split(pageX)
  restUrl[0] = restUrl[0] + "/page/"
  const numPageMatch = pageX.match(/\d+/gi)
  return {
    numPage: Number(numPageMatch[0]),
    restUrl
  };
}

const findPageLink = async (homepage) => {
  const browser = await puppeteer.launch(config.launch);
  const page = await browser.newPage();
  await page.goto(homepage);
  await page.waitForSelector('img', config.waitForSelector)
  const linkList = await page.evaluate(() => {
    const nodeList = document.querySelectorAll('div.navPageNumbers a');
    // Turn nodeList into array
    const _anchors = []
    for(let i = 0; i < nodeList.length; i++) {
      _anchors.push(nodeList[i])
    }
    // We filter anchor has link
    const linkList = _anchors.map(anchor => anchor.getAttribute("href"))
                             .filter(href => href)
    return linkList;
  });
  await browser.close()
  const startPageLink = parseLinkList(linkList[0])
  const lastPageLink = parseLinkList(linkList[linkList.length - 1])
  const pageLink = {
    restUrl: startPageLink.restUrl,
    startNumPage: startPageLink.numPage,
    lastNumPage: lastPageLink.numPage,
  }
  return pageLink
};

var exports = module.exports = findPageLink

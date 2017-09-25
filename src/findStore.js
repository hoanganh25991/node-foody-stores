const puppeteer = require('puppeteer');
const {puppeteer : config} = require("./config")
const defer = require("./defer")

const findStore = async (homepage) => {
  const browser = await puppeteer.launch(config.launch);
  const page = await browser.newPage();
  await page.goto(homepage);
  await defer(3)
  const popup = await page.$("#popup-choose-category > ul > li:nth-child(1) > a");
  await popup.click();
  await defer(1)

  const steps = [
    "#searchFormTop > div > a",
    "#search-filter-dis-4",
    "#fdDlgSearchFilter > div.sf-left > ul > li:nth-child(3)",
    "#search-filter-cate-11",
    "#fdDlgSearchFilter > div.sf-bottom > div > a.fd-btn.blue",
  ]

  await steps.map(async selector => {
    const e = await page.$(selector);
     if(e){
       console.log("See e")
       await e.click();
       await defer(1)
     }
  })

  // const pageInfo = await page.evaluate(async () => {
  //   const defer = async waitTime => await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
  //   const forcePageLoadMoreContent = async (waitTime = null) => {
  //     const body = document.body;
  //     const documentCurrHeight = body.clientHeight
  //     window.scrollBy(0, documentCurrHeight);
  //     waitTime = waitTime ? waitTime : 10;
  //     await defer(waitTime)
  //   }
  //
  //   await defer(3)
  //   document.querySelector("#popup-choose-category > ul > li:nth-child(1) > a").click();
  //   await defer(1)
  //
  //   const steps = [
  //     "#searchFormTop > div > a",
  //     "#search-filter-dis-4",
  //     "#fdDlgSearchFilter > div.sf-left > ul > li:nth-child(3)",
  //     "#search-filter-cate-11",
  //     "#fdDlgSearchFilter > div.sf-bottom > div > a.fd-btn.blue",
  //   ]
  //
  //   await steps.map(async selector => {
  //     const e = document.querySelector(selector);
  //     await defer(1)
  //     e.click();
  //   })
  //
  //   await defer(1)
  //
  //   // // Wait for items load
  //   // await forcePageLoadMoreContent(3)
  //   // await forcePageLoadMoreContent(3)
  //   // await forcePageLoadMoreContent(3)
  //   //
  //   // const loadMoreButton = document.querySelector("#scrollLoadingPage")
  //   //
  //   // let allItemsLoaded = false;
  //   // while(!allItemsLoaded){
  //   //   loadMoreButton.click();
  //   //   await forcePageLoadMoreContent(3)
  //   //   await forcePageLoadMoreContent(3)
  //   //   await forcePageLoadMoreContent(3)
  //   //   const bound = loadMoreButton.getBoundingClientRect();
  //   //   const loadButtonIsHidden = bound.width == 0 && bound.height == 0
  //   //   if(loadButtonIsHidden)
  //   //     allItemsLoaded = true;
  //   // }
  //   //
  //   // const contentContainerDiv = document.querySelector("div.content-container")
  //   // const contentItemNodeList = contentContainerDiv.querySelectorAll("div.content-item")
  //   // const firstItem = document.querySelector("#result-box > div.row-view > div > div > div:nth-child(1) > div.row-view-right > div.result-name > div.resname > h2 > a")
  //
  //   const currUrl = window.location.href
  //
  //   return currUrl;
  // });

  await page.screenshot({path: 'example.png'})
  // Clear browser before out
  await browser.close()
  // Return
  return "hello"
};

var exports = module.exports = findStore



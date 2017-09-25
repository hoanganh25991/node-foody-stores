const puppeteer = require('puppeteer');
const {puppeteer : config} = require("./config")

const findPost = async (url) => {
  const browser = await puppeteer.launch(config.launch);
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector('img', config.waitForSelector)
  const posts = await page.evaluate(() => {
    const nodeList = document.querySelectorAll('div.reddit-post-wrapper');
    const _wrappers = []
    for(let i = 0; i < nodeList.length; i++) {
      _wrappers.push(nodeList[i])
    }
    // We have to filter wrappers out, bcs some wrapper is for ads
    // So, only get exactly className as "reddit-post-wrapper"
    const wrappers = _wrappers.filter(wrapper => {
      const className = wrapper.getAttribute("class")
      return className === "reddit-post-wrapper"
    })
    const posts = wrappers.map(wrapper => {
      const postId = wrapper.getAttribute("data-post-id")
      const post = wrapper.querySelector('div.reddit-post')
      const img = post.querySelector('img');
      const anchorCategory = post.querySelector('div.reddit-post-footer a.category-tag')
      const category = anchorCategory.innerText

      return {
        postId,
        imgUrl: img.src,
        category,
      }
    })

    return posts;
  });
  await browser.close()
  return posts;
}

var exports = module.exports = findPost
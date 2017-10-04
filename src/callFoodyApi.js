/**
 * apiUrl example:
 https://www.foody.vn/__get/Review/ResLoadMore?ResId=46554&isLatest=false&Count=1
 * @param apiUrl
 */

const callFoodyApi = async apiUrl => {
  const fetch = require("isomorphic-fetch")
  const res = await fetch(apiUrl, {
    headers: {
      "x-foody-user-token": "La2qAmY6rxB71YgcUruMGPqsyhy5AUUKzfbzuYyyTzr8nevJB9OP56PiNT3p",
      "x-requested-with": "XMLHttpRequest",
      "cache-control": "no-cache",
      "postman-token": "95e7e2c4-b47b-7467-ee3f-760bf31df3e3"
    }
  })
  const stores = await res.json()
  // console.log(stores)
  return stores
}

var exports = (module.exports = callFoodyApi)

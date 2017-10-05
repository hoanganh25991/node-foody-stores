const fetch = require("isomorphic-fetch")

/**
 * Call foody GET API
 * @param apiUrl
 ex:
 https://www.foody.vn/__get/Review/ResLoadMore?ResId=46554&isLatest=false&Count=1
 */
const callFoodyApi = async (apiUrl, parse = "json") => {
  const res = await fetch(apiUrl, {
    headers: {
      "x-foody-user-token": "La2qAmY6rxB71YgcUruMGPqsyhy5AUUKzfbzuYyyTzr8nevJB9OP56PiNT3p",
      "x-requested-with": "XMLHttpRequest"
    }
  })
  const stores = await res[parse]()
  return stores
}
module.exports = callFoodyApi

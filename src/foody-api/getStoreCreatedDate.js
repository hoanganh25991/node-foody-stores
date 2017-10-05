const callFoodyApi = require("./callFoodyApi")
const urlEndpoint = "https://www.foody.vn/__get/Review/ResLoadMore"
const { todayDDMMYYY } = require("../utils")
const getStoreCreatedDate = async storeId => {
  const reviewUrl = `${urlEndpoint}?ResId=${storeId}&isLatest=false&Count=1`
  const res = await callFoodyApi(reviewUrl)
  const { Items: reviews } = res
  //noinspection JSUnresolvedVariable
  const createdDate = reviews[0] && reviews[0].CreatedOnTimeDiff
  return createdDate ? createdDate : todayDDMMYYY()
}
module.exports = getStoreCreatedDate

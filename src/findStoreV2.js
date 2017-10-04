const logWithInfo = require("./logWithInfo")
const callFoodyApi = require("./callFoodyApi")
const fs = require("fs")
const apiStr = fs.readFileSync(`${__dirname}/api-list.test.json`)
const apiUrlList = JSON.parse(apiStr)
// console.log(apiUrlList)
const urlList = apiUrlList.map(lcXX => {
  const urlObj = Object.values(lcXX)[0]
  const { url } = urlObj
  return url
})

logWithInfo(`List has ${urlList.length} urls`)

const needKeys = [
  "Address",
  "District",
  "City",
  "Phone",
  "SpecialDesc",
  "TotalReview",
  "TotalView",
  "TotalFavourite",
  "TotalCheckins",
  "AvgRating",
  "AvgRatingOriginal",
  "ReviewUrl",
  "AlbumUrl",
  "Latitude",
  "Longitude",
  "MainCategoryId",
  "PictureCount",
  "DistrictId",
  "DistrictUrl",
  "DeliveryUrl",
  "Location",
  "TotalReviewsFormat",
  "TotalPicturesFormat",
  "TotalSaves",
  "Id",
  "Name",
  "PicturePath",
  "PicturePathLarge",
  "MobilePicturePath",
  "DetailUrl"
]

const todayDDMMYYY = () => {
  var today = new Date()
  var dd = today.getDate()
  var mm = today.getMonth() + 1 //January is 0!

  let yyyy = today.getFullYear()
  if (dd < 10) {
    dd = "0" + dd
  }
  if (mm < 10) {
    mm = "0" + mm
  }
  let todayStr = dd + "/" + mm + "/" + yyyy
  return todayStr
}

const readOne = lastStores => async url => {
  let count = 1
  let stillHasStores = true
  let stores = []
  do {
    const urlWithPageQuery = `${url}&page=${count}`
    count++
    const res = await callFoodyApi(urlWithPageQuery)
    const { searchUrl, searchItems: searchStores } = res
    logWithInfo(`Searching...`)
    logWithInfo(`Search url: ${searchUrl}`, 1)
    logWithInfo(`Search find: ${searchStores.length} stores`, 1)
    if (!searchStores.length) stillHasStores = false

    const storesWithNeedInfo = await searchStores.reduce(async (carry, originStore) => {
      const lastStoreList = await carry
      const store = needKeys.reduce((carry, key) => {
        carry[key] = originStore[key]
        return carry
      }, {})
      const { Id: id } = store
      const reviewUrl = `https://www.foody.vn/__get/Review/ResLoadMore?ResId=${id}&isLatest=false&Count=1`
      const res = await callFoodyApi(reviewUrl)
      const { Items: reviews } = res
      let createdDate = todayDDMMYYY()
      const firstReviews = reviews[0]
      if (firstReviews) {
        const { CreatedOnTimeDiff } = firstReviews
        createdDate = CreatedOnTimeDiff
      }
      store["CreatedDate"] = createdDate
      return [...lastStoreList, store]
    }, [])

    stores = [...stores, ...storesWithNeedInfo]
  } while (stillHasStores)
  // console.log(stores, stores.length)
  const next = [...lastStores, ...stores]
  return next
}

// readOne(urlList[0])
/*
  {
    "seoData": {
    "MetaTitle": "Địa điểm Ăn vặt/vỉa hè tại Quận 2, TP. HCM",
      "MetaKeywords": null,
      "MetaDescription": "Danh sách  hơn 51 địa điểm Ăn vặt/vỉa hè tại Quận 2, TP. HCM. Foody.vn là website #1 tại VN về tìm kiếm địa điểm, có hàng ngàn bình luận, hình ảnh"
  },
    "searchItems": [],
    "searchUrl": "/ho-chi-minh/an-vat-via-he-tai-quan-2?c=an-vat-via-he&categorygroup=food",
    "totalResult": 51,
    "totalSubItems": 2
  }
*/

const run = async () => {
  const stores = await urlList.reduce(async (carry, url) => {
    const lastStores = await carry
    return readOne(lastStores)(url)
  }, [])

  console.log(stores.length)
  console.log(stores[0])
}

run()

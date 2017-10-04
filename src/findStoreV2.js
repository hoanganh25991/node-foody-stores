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
    const itemsWithNeedInfo = searchStores.map(originItem => {
      return needKeys.reduce((carry, key) => {
        carry[key] = originItem[key]
        return carry
      }, {})
    })
    stores = [...stores, ...itemsWithNeedInfo]
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
}

run()

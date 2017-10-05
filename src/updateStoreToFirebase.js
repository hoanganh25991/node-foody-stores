const logWithInfo = require("./logWithInfo")
const admin = require("firebase-admin")
const serviceAccount = require("./.credential/glass-turbine-148103-firebase-adminsdk-n0gsz-f4c7be2350.json")
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://glass-turbine-148103.firebaseio.com/"
})
const db = admin.database()
const mainBranch = "nodeFoodyStores"
const storesBranch = "stores"

/**
 * Update to nodeLifeTrick post & category
 * Base on post content after crawling
 *
 * @param {Object} store
 {
    "Address": "104 Xuân Thủy",
    "District": "Quận 2",
    "City": "TP. HCM",
    "Phone": null,
    "SpecialDesc": null,
    "TotalReview": 43,
    "TotalView": 87504,
    "TotalFavourite": 96,
    "TotalCheckins": 13,
    "AvgRating": "7.2",
    "AvgRatingOriginal": 7.234,
    "ReviewUrl": "/ho-chi-minh/kim-thao-hot-vit-lon/binh-luan",
    "AlbumUrl": "/ho-chi-minh/kim-thao-hot-vit-lon/album-anh",
    "Latitude": 10.804002,
    "Longitude": 106.736101,
    "MainCategoryId": 11,//CATEGORY
    "PictureCount": 169,
    "DistrictId": 4,//LOCATION
    "DistrictUrl": "/ho-chi-minh/khu-vuc-quan-2",
    "DeliveryUrl": "/ho-chi-minh/kim-thao-hot-vit-lon/goi-mon",
    "Location": "ho-chi-minh",
    "TotalReviewsFormat": "43",
    "TotalPicturesFormat": "169",
    "TotalSaves": 389,
    "Id": 46554,
    "Name": "Kim Thảo - Hột Vịt Lộn",
    "PicturePath": "https://media.foody.vn/res/g5/46554/prof/s180x180/foody-mobile-csmkm88h-jpg-874-636201612146347618.jpg",
    "PicturePathLarge": "https://media.foody.vn/res/g5/46554/prof/s640x400/foody-mobile-csmkm88h-jpg-874-636201612146347618.jpg",
    "MobilePicturePath": "https://media.foody.vn/res/g5/46554/prof/s640x400/foody-mobile-csmkm88h-jpg-874-636201612146347618.jpg",
    "DetailUrl": "/ho-chi-minh/kim-thao-hot-vit-lon",
 },
 */
const udpateStore = async store => {
  // Find if post exist
  const { Id } = store
  const refToStores = db.ref(`${mainBranch}/${storesBranch}`)

  const sameStore = await new Promise(resolve => {
    refToStores
      .orderByChild("Id")
      .equalTo(Id)
      .limitToFirst(1)
      .once("value", function(snapshot) {
        resolve(snapshot.val())
      })
  })

  // Decide key
  const storeKey = sameStore ? Object.keys(sameStore)[0] : refToStores.push().key

  logWithInfo(`Saving store...`)
  logWithInfo(`Store id: ${Id}`, 1)
  logWithInfo(`Store key: ${storeKey}`, 1)

  await db.ref(`n${mainBranch}/${storesBranch}/${storeKey}`).set(store)
}

const updateStores = async stores => {
  await stores.reduce(async (carry, postWithCategory) => {
    await carry
    return udpateStore(postWithCategory)
  }, Promise.resolve(console.log("Updating stores...")))
}

var exports = (module.exports = updateStores)

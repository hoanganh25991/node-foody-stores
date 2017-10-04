const admin = require("firebase-admin")
// Fetch the service account key JSON file contents
const serviceAccount = require("./.credential/glass-turbine-148103-firebase-adminsdk-n0gsz-f4c7be2350.json")
// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://glass-turbine-148103.firebaseio.com/"
})
// As an admin, the app has access to read and write all data, regardless of Security Rules
const db = admin.database()

const branch = "nodeLifeTrick"

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
const updateSinglePostWithCategory = async store => {
  // Find if post exist
  const { postId, imgUrl, category: categoryName } = store
  const refToCategories = db.ref("/categories")
  const sameCategory = await new Promise(resolve => {
    refToCategories
      .orderByChild("name")
      .equalTo(categoryName)
      .limitToFirst(1)
      .once("value", function(snapshot) {
        resolve(snapshot.val())
      })
  })

  const categoryKey = sameCategory ? Object.keys(sameCategory)[0] : refToCategories.push().key
  console.log(`[INFO] Updating categoryKey: ${categoryKey}`)
  await db.ref(`nodeLifeTrick/categories/${categoryKey}`).set({ name: categoryName })

  const refToPosts = db.ref("nodeLifeTrick/posts")
  const samePost = await new Promise(resolve => {
    refToPosts
      .orderByChild("postId")
      .equalTo(postId)
      .limitToFirst(1)
      .once("value", function(snapshot) {
        resolve(snapshot.val())
      })
  })
  const postKey = samePost ? Object.keys(samePost)[0] : refToPosts.push().key
  console.log(`[INFO] Updating postKey: ${postKey}`)
  await db.ref(`nodeLifeTrick/posts/${postKey}`).set({ postId, imgUrl, categoryId: categoryKey })
}

const updateManyPostWithCategorys = async postWitchCategorys => {
  await postWitchCategorys.map(postWithCategory => updateSinglePostWithCategory(postWithCategory))
}

var exports = (module.exports = updateManyPostWithCategorys)

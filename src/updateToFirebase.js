const admin = require("firebase-admin");
// Fetch the service account key JSON file contents
const serviceAccount = require("./.credential/glass-turbine-148103-firebase-adminsdk-n0gsz-f4c7be2350.json");
// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://glass-turbine-148103.firebaseio.com/"
});
// As an admin, the app has access to read and write all data, regardless of Security Rules
const db = admin.database();
/**
 * Update to nodeLifeTrick post & category
 * Base on post content after crawling
 *
 * @param {Object} postWithCategory
   {
     postId: <number>,
     imgUrl: <string>,
     category: <string>
   }
 */
const updateSinglePostWithCategory = async(postWithCategory) => {
  // Find if post exist
  const {postId, imgUrl, category:categoryName} = postWithCategory
  const refToCategories = db.ref("nodeLifeTrick/categories")
  const sameCategory = await new Promise(resolve => {
    refToCategories
      .orderByChild("name")
      .equalTo(categoryName)
      .limitToFirst(1)
      .once("value", function(snapshot) {
        resolve(snapshot.val())
      })
  })

  const categoryKey = sameCategory ? Object.keys(sameCategory)[0] : refToCategories.push().key;
  console.log(`[INFO] Updating categoryKey: ${categoryKey}`)
  await db.ref(`nodeLifeTrick/categories/${categoryKey}`).set({name: categoryName})

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
  const postKey = samePost ? Object.keys(samePost)[0] : refToPosts.push().key;
  console.log(`[INFO] Updating postKey: ${postKey}`)
  await db.ref(`nodeLifeTrick/posts/${postKey}`).set({postId, imgUrl, categoryId: categoryKey})
}

const updateManyPostWithCategorys = async (postWitchCategorys) => {
  await postWitchCategorys.map(postWithCategory => updateSinglePostWithCategory(postWithCategory))
}

var exports = module.exports = updateManyPostWithCategorys
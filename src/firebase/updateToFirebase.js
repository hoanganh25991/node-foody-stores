const { logDebug, logExactErrMsg } = require("./../log/index")
const admin = require("firebase-admin")
const serviceAccount = require("./../.credential/glass-turbine.json")
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://glass-turbine-148103.firebaseio.com/"
})
const db = admin.database()

const updateObjX = mainBranch => objXBranch => objXIndexKey => async objX => {
  // Find if post exist
  const { [objXIndexKey]: id } = objX
  const refToObjXBranch = db.ref(`${mainBranch}/${objXBranch}`)
  const sameObjX = await new Promise(resolve => {
    refToObjXBranch
      .orderByChild(objXIndexKey)
      .equalTo(id)
      .limitToFirst(1)
      .once("value", function(snapshot) {
        resolve(snapshot.val())
      })
  })
  const objXKey = sameObjX ? Object.keys(sameObjX)[0] : refToObjXBranch.push().key
  logDebug(`Saving store...`)
  logDebug([`ObjX ${objXIndexKey} : ${id}`, `ObjX key: ${objXKey}`], 1)
  await db.ref(`${mainBranch}/${objXBranch}/${objXKey}`).update(objX)
  logDebug("Saved")
}

const updateManyObjXs = mainBranch => objXBranch => objXIndexKey => objXs => {
  return objXs.reduce(async (carry, objX) => {
    await carry
    return updateObjX(mainBranch)(objXBranch)(objXIndexKey)(objX)
  }, 123)
}

// Remove stores branch
// (async () => {
//   const storesRef = db.ref("nodeFoodyStores/stores")
//   await storesRef.remove()
//   console.log("Done")
//   process.exit()
// })()

module.exports = updateManyObjXs
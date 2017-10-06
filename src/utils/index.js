const apiUrlList = require("../storage/api-list.bak.json")
const sendNotification = require("./sendNotification")

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

//noinspection JSUnresolvedFunction
const urlList = apiUrlList.map(lcXX => {
  const urlObj = Object.values(lcXX)[0]
  const { url } = urlObj
  return url
})

const defer = async waitTime => await new Promise(resolve => setTimeout(resolve, waitTime * 1000))

module.exports = {
  defer,
  todayDDMMYYY,
  urlList,
  sendNotification
}

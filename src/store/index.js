const state = {}
const argv = require("minimist")(process.argv.slice(2))
const { logDebug: _ } = require("../log")

// try{
//   const initStateFilePath = argv["state"]
//   const fullPath = `${__dirname}/../../${initStateFilePath}`
//
//   const initState = require()
// }

const store = {
  getState() {
    return state
  },
  setState(obj) {
    Object.assign(state, obj)
  }
}

module.exports = store

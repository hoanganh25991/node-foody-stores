const state = {}

const store = {
  getState() {
    return state
  },
  setState(obj) {
    Object.assign(state, obj)
  }
}

module.exports = store

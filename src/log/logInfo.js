const store = require("../store")
const logKey = "_log"
const defaultLogState = {
  logLevel: 1,
  spaceIndent: 2
}

const getLogState = (nextState = null) => {
  const { [logKey]: prevState = defaultLogState } = store.getState()
  const logState = Object.assign(prevState, nextState)
  return logState
}

const getPadding = (nextState = null) => {
  const logState = getLogState(nextState)
  const { logLevel, spaceIndent } = logState

  const padding = Array(logLevel * spaceIndent + 1).join(" ")

  return padding
}

const logInfo = (nextState = null) => (logs, style = "%s") => {
  const padding = getPadding(nextState)
  const { logLevel } = padding
  const paddingWithRootSlash = logLevel > 0 ? `${padding}\\__` : padding

  const isArr = Array.isArray(logs)
  const isStr = typeof logs === "string"

  switch (true) {
    case isArr: {
      console.log(style, `[INFO] ${paddingWithRootSlash}`, ...logs)
      break
    }
    case isStr: {
      console.log(style, `[INFO] ${paddingWithRootSlash}${logs}`)
      break
    }
    default: {
      console.log(style, `[INFO] ${paddingWithRootSlash}`, logs)
      break
    }
  }

  return
}

logInfo.getDefaultState = () => defaultLogState
logInfo.getLogKey = () => logKey
logInfo.getLogState = getLogState
logInfo.getPadding = getPadding

module.exports = logInfo

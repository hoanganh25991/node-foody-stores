const store = require("../store")
const logKey = "_log"
const defaultLogState = {
  logLevel: 1,
  spaceIndent: 2
}

const getLogState = (addUp = 0, nextState = null) => {
  const { [logKey]: currState = defaultLogState } = store.getState()
  const logState = Object.assign(currState, nextState)
  const { logLevel: currLogLevel } = logState
  const logLevel = currLogLevel + addUp
  Object.assign(logState, { logLevel })
  console.log(JSON.stringify(logState))
  return logState
}

const getPadding = (addUp = 0, nextState = null) => {
  const logState = getLogState(nextState)
  const { logLevel, spaceIndent } = logState

  const padding = Array(logLevel * spaceIndent + 1).join(" ")

  return padding
}

const logInfo = (addUp = 0, nextState = null) => (logs, style = "%s") => {
  const padding = getPadding(addUp, nextState)
  const { logLevel } = getLogState(addUp, nextState)
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

  return logLevel
}

store.setState({ [logKey]: defaultLogState })

logInfo.getDefaultState = () => defaultLogState
logInfo.getLogKey = () => logKey
logInfo.getLogState = getLogState
logInfo.getPadding = getPadding

module.exports = logInfo

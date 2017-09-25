var exports = module.exports = {}

const puppeteer = {
  launch: {
    timeout: 30000,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  waitForSelector: {
    timeout: 30000
  }
}

exports.puppeteer = puppeteer
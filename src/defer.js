/**
 * Like sleep
 * @param waitTime // in seconds
 */
const defer = async waitTime => await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
var exports = module.exports = defer
const development = require('./development.js');
const production = require('./production.js');
const test = require('./test.js');

module.exports = process.env.NODE_ENV === "development" ? development : (process.env.NODE_ENV === "test" ? test : production);
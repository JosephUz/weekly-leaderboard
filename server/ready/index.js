const week = require('week');
const Ready = require('./ready.js');
const constant = require('./constant.js');

module.exports = {
    constant: constant,
    score: {
        daily: new Ready(() => {
            return `$score_${new Date().getFullYear()}_${Number(week())}_${new Date().getDay()}`;
        }),
        weekly: new Ready(() => {
            return `$score_${new Date().getFullYear()}_${Number(week())}`;
        }),
    }
}
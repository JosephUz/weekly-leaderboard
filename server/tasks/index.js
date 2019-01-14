const jueue = require('jueue');
const daily = require('./daily.task.js');
const weekly = require('./weekly.task.js');

function start() {
    return jueue.promise(e => {
        daily.start().then(() => {
            e.next();
        }).catch(e.throw);
    }, e => {
        weekly.start().then(() => {
            e.done();
        }).catch(e.throw);
    });
}

module.exports = {
    start
}
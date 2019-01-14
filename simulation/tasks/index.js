const jueue = require('jueue');
const minutely = require('./minutely.task.js');

function start() {
    return jueue.promise(e => {
        minutely.start().then(() => {
            e.done();
        }).catch(e.throw);
    });
}

module.exports = {
    start
}
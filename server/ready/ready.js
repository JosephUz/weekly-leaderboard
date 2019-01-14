const jueue = require('jueue');
const constant = require('./constant.js');

// This object representative to redis.
var ready = {};
var events = {};

function Ready(key) {
    this.key = key;
}

Ready.prototype.get = function () {
    var k = this.key();
    return jueue.promise(e => {
        e.done(ready[k] || constant.NOT_READY);
    });
}

Ready.prototype.start = function () {
    var k = this.key();
    return jueue.promise(e => {
        this.get().then(v => {
            if (v == constant.NOT_READY)
                e.next();
            else
                e.throw(new Error('already started'));
        }).catch(e.throw);
    }, e => {
        ready[k] = constant.PENDING;
        e.done();
    });
}

Ready.prototype.done = function () {
    var k = this.key();
    return jueue.promise(e => {
        this.get().then(v => {
            if (v == constant.PENDING)
                e.next();
            else
                e.throw(new Error('not started'));
        }).catch(e.throw);
    }, e => {
        ready[k] = constant.DONE;
        e.done();
        trigger(k);
    });
}

Ready.prototype.ready = function () {
    var k = this.key();
    if (events[k] == null)
        events[k] = [];
    return jueue.promise(e => {
        this.get().then(v => {
            if (v == constant.DONE)
                e.done();
            else
                e.next();
        }).catch(e.throw);
    }, e => {
        events[k].push(v => {
            e.done();
        });
    });
}

function trigger(k) {
    if (events[k] && events[k].length > 0) {
        events[k].splice(0, 1)[0](ready[k]);
        trigger(k);
    }
}

module.exports = Ready;
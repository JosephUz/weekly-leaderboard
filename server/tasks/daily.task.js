const jueue = require('jueue');
const schedule = require('node-schedule');
const ready = require('../ready');
const repositories = require('../repositories');

var scheduling = null;

function start() {
    return jueue.promise(e => {
        ready.score.daily.start().then(() => {
            e.next();
        }).catch(e.throw);
    }, e => {
        repositories.score.exists().then(check => {
            if (check)
                e.next('done');
            else
                e.next();
        });
    }, e => {
        repositories.score.index().then(() => {
            e.next();
        }).catch(e.throw);
    }, function getFirst(e) {
        e.date = new Date();
        if (e.date.getDay() == 0) {
            e.next('done');
        } else {
            e.date.setDate(e.date.getDate() - 1);
            repositories.score.getFirst(e.date).then(score => {
                if (score)
                    e.next('getGift');
                else
                    e.next();
            }).catch(e.throw);
        }
    }, function setRank(e) {
        repositories.score.setRank(e.date).then(() => {
            e.next();
        }).catch(e.throw);
    }, function getGift(e) {
        repositories.gift.get(e.date).then(gift => {
            if (gift)
                e.next('clone');
            else
                e.next();
        }).catch(e.throw);
    }, function total(e) {
        repositories.score.total(e.date).then(total => {
            e.total = total;
            e.next();
        }).catch(e.throw);
    }, function add(e) {
        repositories.gift.add(e.date, e.total).then(() => {
            e.next();
        }).catch(e.throw);
    }, function clone(e) {
        repositories.score.clone(e.date).then(() => {
            e.next();
        }).catch(e.throw);
    }, function done(e) {
        ready.score.daily.done().then(() => {
            e.done();
            job();
        }).catch(e.throw);
    });
}

function job() {
    if (scheduling == null)
        schedule.scheduleJob({ hour: 0, minute: 0, second: 1 }, function (date) {
            start().then(() => {
                console.log(`daily task done for ${date.toISOString()}`);
            }).catch(err => {
                console.log(`server task error for ${date.toISOString()} and message: ${err.message}`);
            });
        });
    return scheduling;
}

module.exports = {
    start,
    job
}
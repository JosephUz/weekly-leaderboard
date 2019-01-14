const jueue = require('jueue');
const schedule = require('node-schedule');
const ready = require('../ready');
const repositories = require('../repositories');

var scheduling = null;

function start() {
    return jueue.promise(e => {
        ready.score.weekly.start().then(() => {
            e.next();
        }).catch(e.throw);
    }, e => {
        e.date = new Date();
        e.date.setDate(e.date.getDate() - e.date.getDay() - 1);
        repositories.gift.get(e.date).then(gift => {
            e.gift = gift;
            if (e.gift && e.gift.done == false) {
                e.next();
            } else {
                e.next('done');
            }
        }).catch(e.throw);
    }, e => {
        repositories.gift.total(e.date).then(gift => {
            e.gift = gift;
            e.next();
        }).catch(e.throw);
    }, e => {
        repositories.score.top(e.date).then(users => {
            e.users = users;
            e.next();
        }).catch(e.throw);
    }, e => {
        repositories.user.gift(users.map(doc => {
            return {
                userId: doc.userId,
                money: e.gift.total * (doc.rank == 1 ? 0.2 : (doc.rank == 2 ? 0.15 : (doc.rank == 3 ? 0.1 : (0.55 / 97))))
            };
        })).then(() => {
            e.next();
        }).catch(e.throw);
    }, e => {
        repositories.gift.done(e.date).then(() => {
            e.next();
        }).catch(e.throw);
    }, e => {
        repositories.score.clear(e.date).then(() => {
            e.next();
        }).catch(e.throw);
    }, function done(e) {
        ready.score.weekly.done().then(() => {
            e.done();
            job();
        }).catch(e.throw);
    });
}

function job() {
    if (scheduling == null)
        schedule.scheduleJob({ hour: 0, minute: 15, second: 0, dayOfWeek: 0 }, function (date) {
            start().then(() => {
                console.log(`weekly task done for ${date.toISOString()}`);
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
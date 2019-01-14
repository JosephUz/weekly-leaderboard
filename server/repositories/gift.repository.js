const jueue = require('jueue');
const week = require('week');
const mongo = require('./mongo.js');

function total(date) {
    return mongo.process(e => {
        e.db.collection('gifts').aggregate([
            {
                $match: {
                    year: date.getFullYear(),
                    week: Number(week(date))
                }
            },
            {
                $group: {
                    _id: { year: '$year', week: '$week' },
                    total: { $sum: '$total' }
                }
            },
            {
                $project: {
                    total: '$total'
                }
            }
        ]).toArray().then(gifts => {
            e.done(gifts[0]);
        }).catch(e.throw);
    });
}

function get(date) {
    return mongo.process(e => {
        e.db.collection('gifts').find({
            year: date.getFullYear(),
            week: Number(week(date)),
            day: date.getDay(),
        }).project({ _id: 0 }).toArray().then(docs => {
            e.done(docs[0]);
        }).catch(e.throw);
    });
}

function add(date, total) {
    return mongo.process(e => {
        var data = {
            year: date.getFullYear(),
            week: Number(week(date)),
            day: date.getDay(),
            total: total,
            done: false
        };
        e.db.collection('gifts').insertOne(data).then(() => {
            e.done();
        }).catch(e.throw);
    });
}

function done(date) {
    return mongo.process(e => {
        e.db.collection('gifts').updateMany({
            year: date.getFullYear(),
            week: Number(week(date)),
        }, { $set: { done: true } }).then(() => {
            e.done();
        }).catch(e.throw);
    });
}

module.exports = {
    total,
    add,
    done,
    get
};
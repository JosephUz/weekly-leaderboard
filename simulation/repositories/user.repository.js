const jueue = require('jueue');
const mongo = require('./mongo.js');
const config = require('../config');

function add() {
    return mongo.process(function add(e) {
        e.count = e.count || 0;
        if (e.count < config.userCount) {
            var users = [];
            while (users.length < (config.userCount / 10)) {
                users.push({
                    userId: mongo.id(),
                    userName: "User" + (users.length + e.count + 1),
                    age: Math.floor(Math.random() * 63),
                    money: 0
                });
            }
            e.count += users.length;
            e.db.collection('users').insertMany(users).then(() => {
                e.next("add");
            }).catch(e.throw);
        } else {
            e.done();
        }
    });
}

function exists() {
    return mongo.process(e => {
        e.db.collection('users').find({}).limit(1).project({ _id: 0 }).toArray().then(docs => {
            e.done(docs.length > 0);
        }).catch(e.throw);
    });
}

function clear() {
    return mongo.process(e => {
        e.db.dropCollection("users").then(() => {
            e.done();
        }).catch(e.throw);
    });
}

function createIndex(fields) {
    return mongo.process(e => {
        e.db.collection('users').createIndex(fields).then(name => {
            e.done();
        }).catch(e.throw);
    });
}

function index() {
    return jueue.promise(e => {
        exists().then(check => {
            if (check)
                e.done();
            else
                e.next();
        }).catch(e.throw);
    }, e => {
        createIndex({ userId: 1 }).then(() => {
            e.next();
        }).catch(e.throw);
    }, e => {
        createIndex({ userName: 1 }).then(() => {
            e.done();
        }).catch(e.throw);
    });
}

module.exports = {
    add,
    exists,
    clear,
    index
};
const jueue = require('jueue');
const mongo = require('./mongo.js');

function get(userName) {
    return mongo.process(e => {
        e.db.collection("users").find({ userName: userName }).project({ _id: 0 }).toArray().then(docs => {
            e.done(docs[0]);
        }).catch(e.throw);
    });
}

function gift(users) {
    var data = users.map(doc => {
        return {
            updateOne:
            {
                filter: { userId: doc.userId },
                update: { $inc: { money: doc.money } }
            }
        };
    });

    return mongo.process(e => {
        e.db.collection("users").bulkWrite(data).then(() => {
            e.done();
        }).catch(e.throw);
    });
}

function exist(userName) {
    return mongo.process(e => {
        e.db.collection("users").find({ userName: userName }).project({ _id: 1 }).toArray().then(docs => {
            e.done(docs.length > 0);
        }).catch(e.throw);
    });
}

function existById(userId) {
    return mongo.process(e => {
        e.db.collection("users").find({ userId: userId }).project({ _id: 1 }).toArray().then(docs => {
            e.done(docs.length > 0);
        }).catch(e.throw);
    });
}

function add(userName, age) {
    return mongo.process(e => {
        e.db.collection("users").insertOne({
            userId: mongo.id(),
            userName: userName,
            money: 0,
            age: age
        }).then(() => {
            e.done();
        }).catch(e.throw);
    });
}

function exists() {
    return mongo.process(e => {
        e.db.collection('users').find({}).limit(1).project({ _id: 0 }).toArray().then(docs => {
            e.done(docs.length > 0);
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
    get,
    exist,
    existById,
    add,
    index,
    gift
};
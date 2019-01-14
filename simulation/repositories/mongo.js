const jueue = require('jueue');
const mongodb = require('mongodb');
const config = require('../config');

const MongoClient = mongodb.MongoClient;

function id() {
    return new mongodb.ObjectId().toString();
}

function mongo() {
    return jueue.get(e => {
        new MongoClient(config.mongo.url, { useNewUrlParser: true }).connect().then(client => {
            e.client = client;
            e.done(client, client.db(config.mongo.db));
        }).catch(e.throw);
    });
}


function process() {
    var args = arguments;
    return jueue.promise(e => {
        mongo().then((client, db) => {
            e.client = client;
            e.db = db;
            e.next();
        }).catch(e.throw);
    }, e => {
        var fns = [e2 => {
            e2.client = e.client;
            e2.db = e.db;
            e2.next();
        }];
        for (let index = 0; index < args.length; index++) {
            fns.push(args[index]);
        }
        jueue.get(fns).then(result => {
            e.result = result;
            e.next();
        }).catch(e.throw);
    }, e => {
        e.client.close();
        e.done(e.result);
    });
}

module.exports = {
    process,
    id
};
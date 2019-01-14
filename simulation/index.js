const jueue = require('jueue');
const config = require('./config');
const repositories = require('./repositories');
const tasks = require('./tasks');

var started = false;

function users() {
    return jueue.promise(e => {
        repositories.user.exists().then(check => {
            if (check)
                e.done();
            else
                e.next();
        }).catch(e.throw);
    }, e => {
        repositories.user.add().then(() => {
            e.done();
        }).catch(e.throw);
    });
}

function start() {
    return jueue.promise(e => {
        if (started)
            e.done();
        else
            e.next();
    }, e => {
        repositories.user.index().then(() => {
            e.next();
        }).catch(e.throw);
    }, e => {
        users().then(() => {
            console.log("users created.");
            started = true;
            e.done();
        }).catch(e.throw);
    });
}

if (process.env.START == "on")
    start();

module.exports = {
    start,
    users,
    config,
    repositories,
    tasks
}
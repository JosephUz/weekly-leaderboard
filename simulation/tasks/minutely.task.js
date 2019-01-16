const jueue = require('jueue');
const schedule = require('node-schedule');
const post = require('./post.js');
const config = require('../config');

var scheduling = null;

function start() {
    return jueue.promise(e => {
        var userName = "User" + Math.floor(Math.random() * config.userCount);
        post('/user/get', { userName: userName }).then(res => {
            e.user = res.data;
            e.next();
        }).catch(e.throw);
    }, e => {
        if (e.user) {
            var index = 0;
            var interval = setInterval(() => {
                post('/score/add', { userId: e.user.userId, score: Math.floor(Math.random() * 1000) });
                index++;
                if (index == 10)
                    clearInterval(interval);
            }, 1000);
        }
        e.done();
        job();
    });
}

function job() {
    if (scheduling == null)
        scheduling = schedule.scheduleJob({ second: 0 }, function (date) {
            for (var index = 0; index < 30; index++) {
                start();
            }
        })
    return scheduling;
}

module.exports = {
    start,
    job
}
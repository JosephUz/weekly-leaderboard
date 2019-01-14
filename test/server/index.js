const request = require('request');
const jueue = require('jueue');
const config = require('../../server/config');

const server = require('../../server');
const simulation = require('../../simulation');

var baseUrl = `${config.host}:${config.port}`;

function post(url, data) {
    return jueue.promise(e => {
        simulation.start().then(() => {
            e.next();
        }).catch(e.throw);
    }, e => {
        server.start().then(app => {
            e.next();
        }).catch(e.throw);
    }, e => {
        request.post({
            baseUrl: baseUrl,
            url: url,
            json: data,
        }, function (err, res, body) {
            if (err)
                e.throw(err);
            else
                e.done(body);
        });
    })
}

module.exports = {
    post,
}
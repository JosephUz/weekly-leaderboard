const request = require('request');
const jueue = require('jueue');
const config = require('../config');

var baseUrl = `${config.host}:${config.port}`;

function post(url, data) {
    return jueue.promise(e => {
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

module.exports = post;
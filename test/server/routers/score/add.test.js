const jueue = require('jueue');
const server = require('../../');
const Joi = require('joi');

var schema = Joi.object().keys({
    status: Joi.boolean().required(),
    code: Joi.string().required(),
    message: Joi.string().allow(""),
    data: Joi.object().allow(null),
});

describe('/score/add', () => {
    it('add score', done => {
        jueue.get(e => {
            server.post('/user/get', { userName: "User1" }).then(res => {
                if (res.status) {
                    e.user = res.data;
                    e.next();
                } else {
                    done(new Error('Fail!'));
                }
            }).catch(done);
        }, e => {
            server.post('/score/add', { userId: e.user.userId, score: Math.floor(Math.random() * 1000) }).then(res => {
                Joi.validate(res, schema).then(() => {
                    if (res.code == "ok")
                        done();
                    else
                        done(new Error('Fail!'));
                }).catch(done);
            }).catch(done);
        });
    }).timeout(600000);

    it('bad request', done => {
        server.post('/score/add', {}).then(res => {
            Joi.validate(res, schema).then(() => {
                if (res.code == "badrequest")
                    done();
                else
                    done(new Error('Fail!'));
            }).catch(done);
        }).catch(done);
    });
});
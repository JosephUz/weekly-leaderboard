const jueue = require('jueue');
const server = require('../../');
const Joi = require('joi');

var schema = Joi.object().keys({
    status: Joi.boolean().required(),
    code: Joi.string().required(),
    message: Joi.string().allow(""),
    data: Joi.object().allow(null).keys({
        userId: Joi.string().required(),
        money: Joi.number().required(),
        userName: Joi.string().required(),
        age: Joi.number().required(),
    }),
});

describe('/user/get', () => {
    it('get user', done => {
        var userName = "User2";
        server.post('/user/get', { userName: userName }).then(res => {
            Joi.validate(res, schema).then(() => {
                if (res.code == "ok" && res.data.userName == userName)
                    done();
                else
                    done(new Error('Fail!'));
            }).catch(done);
        }).catch(done);
    }).timeout(600000);

    it('not exists user', done => {
        var userName = "NotUser";
        server.post('/user/get', { userName: userName }).then(res => {
            Joi.validate(res, schema).then(() => {
                if (res.code == "ok" && res.data == null)
                    done();
                else
                    done(new Error('Fail!'));
            }).catch(done);
        }).catch(done);
    }).timeout(5000);

    it('bad request', done => {
        server.post('/user/get', {}).then(res => {
            Joi.validate(res, schema).then(() => {
                if (res.code == "badrequest")
                    done();
                else
                    done(new Error('Fail!'));
            }).catch(done);

        }).catch(done);
    });
});
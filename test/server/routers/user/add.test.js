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

describe('/user/add', () => {
    var userName = 'User' + Date.now().toString(), age = 30;
    it('add user', done => {
        server.post('/user/add', { userName: userName, age: age }).then(res => {
            Joi.validate(res, schema).then(() => {
                if (res.code == "ok" && res.data.userName == userName && res.data.age == age)
                    done();
                else
                    done(new Error('Fail!'));
            }).catch(done);
        }).catch(done);
    }).timeout(600000);

    it('exists user', done => {
        server.post('/user/add', { userName, age }).then(res => {
            Joi.validate(res, schema).then(() => {
                if (res.code == "ua1")
                    done();
                else
                    done(new Error('Fail!'));
            }).catch(done);
        }).catch(done);
    }).timeout(5000);

    it('bad request', done => {
        server.post('/user/add', {}).then(res => {
            Joi.validate(res, schema).then(() => {
                if (res.code == "badrequest")
                    done();
                else
                    done(new Error('Fail!'));
            }).catch(done);
        }).catch(done);
    });
});
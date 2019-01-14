const jueue = require('jueue');
const server = require('../../');
const Joi = require('joi');

var schema = Joi.object().keys({
    status: Joi.boolean().required(),
    code: Joi.string().required(),
    message: Joi.string().allow(""),
    data: Joi.object().allow(null).keys({
        leaders: Joi.array().items(Joi.object().keys({
            userId: Joi.string().required(),
            money: Joi.number().required(),
            userName: Joi.string().required(),
            age: Joi.number().required(),
            score: Joi.number().required(),
            rank: Joi.number().required(),
            rankChanges: Joi.number().required()
        })),
        own: Joi.array().items(Joi.object().keys({
            userId: Joi.string().required(),
            money: Joi.number().required(),
            userName: Joi.string().required(),
            age: Joi.number().required(),
            score: Joi.number().required(),
            rank: Joi.number().required(),
            rankChanges: Joi.number().required(),
        }))
    }),
});

describe('/score/list', () => {
    it('get leader list', done => {
        jueue.get(e => {
            server.post('/user/get', { userName: "User10000" }).then(res => {
                if (res.status) {
                    e.user = res.data;
                    e.next();
                } else {
                    done(new Error('Fail!'));
                }
            }).catch(done);
        }, e => {
            server.post('/score/list', { userId: e.user.userId }).then(res => {
                Joi.validate(res, schema).then(() => {
                    if (res.code == "ok") {
                        e.user = res.data.leaders.filter(leader => { return leader.rank == 1; })[0];
                        e.nextRank = res.data.leaders.length - 2;
                        if (e.user)
                            e.next();
                        else
                            done();
                    } else
                        done(new Error('Fail!'));
                }).catch(done);
            }).catch(done);
        }, e => {
            server.post('/score/list', { userId: e.user.userId }).then(res => {
                Joi.validate(res, schema).then(() => {
                    if (res.code == "ok" && res.data.own.length > 0 && res.data.leaders.length <= 100)
                        done();
                    else if (res.code == "ok" && res.data.own.length == 0) {
                        e.user = res.data.leaders.filter(leader => { return leader.rank == e.nextRank; })[0];
                        e.nextRank++;
                        if (e.user)
                            e.next(2);
                        else
                            done();
                    } else
                        done(new Error('Fail!'));
                }).catch(done);
            }).catch(done);
        });
    }).timeout(600000);

    it('bad request', done => {
        server.post('/score/list', {}).then(res => {
            Joi.validate(res, schema).then(() => {
                if (res.code == "badrequest")
                    done();
                else
                    done(new Error('Fail!'));
            }).catch(done);
        }).catch(done);
    });
});
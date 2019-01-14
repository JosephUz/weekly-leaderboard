const jueue = require('jueue');
const server = require('../../');
const Joi = require('joi');

var schema = Joi.object().keys({
    status: Joi.boolean().required(),
    code: Joi.string().required(),
    message: Joi.string().allow(""),
    data: Joi.object().allow(null).keys({
        gift: Joi.number().required()
    }),
});

describe('/score/gift', () => {
    it('get gift', done => {
        server.post('/score/gift', {}).then(res => {
            Joi.validate(res, schema).then(() => {
                if (res.code == "ok")
                    done();
                else
                    done(new Error('Fail!'));
            }).catch(done);
        }).catch(done);
    }).timeout(600000);
});
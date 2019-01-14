const Joi = require('joi');

module.exports = Joi.object().keys({
    userName: Joi.string().required(),
    age: Joi.number().required()
});
const Joi = require('joi');

module.exports = Joi.object().keys({
    userId: Joi.string().required(),
    score: Joi.number().positive().required()
});
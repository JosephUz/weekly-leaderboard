const Joi = require('joi');

module.exports = Joi.object().keys({
    userName: Joi.string().required()
});
const returnModel = require('./return.model.js');

function model(req, err) {
    var code = "unknown";
    var message = req.i18n_texts.error.unknown;
    if (req.i18n_texts.error.code[err.message]) {
        code = err.message;
        message = req.i18n_texts.error.code[err.message];
    }
    return returnModel({ status: false, message: message, code: code });
}

module.exports = model;
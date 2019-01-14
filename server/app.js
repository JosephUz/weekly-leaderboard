const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const i18n = require("i18n-express");
const cors = require('cors');
const routers = require('./routers');
const models = require('./models');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(i18n({
    translationsPath: path.join(__dirname, 'locales'),
    siteLangs: ["en"]
}));
app.use(cors());

routers.set(app);
app.use((req, res, next) => {
    res.send(models.error(req, new Error("notfound")));
});

module.exports = app;
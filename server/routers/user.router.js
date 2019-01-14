const express = require('express');
const jueue = require('jueue');
const joi = require('joi');
const repositories = require('../repositories');
const schemas = require('../schemas')
const models = require('../models');

var router = express.Router();

router.post('/add', (req, res) => {
    jueue.get(e => {
        joi.validate(req.body, schemas.user.add).then(() => {
            e.next();
        }).catch(err => {
            e.throw(new Error('badrequest'));
        });
    }, e => {
        repositories.user.exist(req.body.userName).then(check => {
            if (check)
                e.throw(new Error('ua1'));
            else
                e.next();
        }).catch(e.throw);
    }, e => {
        repositories.user.add(req.body.userName, req.body.age).then(() => {
            e.next();
        }).catch(e.throw);
    }, e => {
        repositories.user.get(req.body.userName).then(user => {
            e.done(user);
        }).catch(e.throw);
    }).then(user => {
        res.send(models.return({ data: user }));
    }).catch(err => {
        res.send(models.error(req, err));
    });
});

router.post('/get', (req, res) => {
    jueue.get(e => {
        joi.validate(req.body, schemas.user.get).then(() => {
            e.next();
        }).catch(err => {
            e.throw(new Error('badrequest'));
        });
    }, e => {
        repositories.user.get(req.body.userName).then(user => {
            e.done(user);
        }).catch(e.throw);
    }).then(user => {
        res.send(models.return({ data: user }));
    }).catch(err => {
        res.send(models.error(req, err));
    });
});

module.exports = router;
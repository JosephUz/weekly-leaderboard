const express = require('express');
const jueue = require('jueue');
const joi = require('joi');
const repositories = require('../repositories');
const schemas = require('../schemas')
const models = require('../models');

var router = express.Router();

router.post('/add', (req, res) => {
    jueue.get(e => {
        joi.validate(req.body, schemas.score.add).then(() => {
            e.next();
        }).catch(err => {
            e.throw(new Error('badrequest'));
        });
    }, e => {
        repositories.user.existById(req.body.userId).then(check => {
            if (check)
                e.next();
            else
                e.throw(new Error('sa1'));
        }).catch(e.throw);
    }, e => {
        repositories.score.upsert(req.body.userId, req.body.score).then(() => {
            e.done();
        }).catch(e.throw);
    }).then(() => {
        res.send(models.return({}));
    }).catch(err => {
        res.send(models.error(req, err));
    });
});

router.post('/gift', (req, res) => {
    jueue.get(e => {
        repositories.gift.total(new Date()).then(gift => {
            e.done((gift && gift.total) || 0);
        }).catch(e.throw);
    }).then(total => {
        res.send(models.return({ data: { gift: total } }));
    }).catch(err => {
        res.send(models.error(req, err));
    });
});

router.post('/list', (req, res) => {
    jueue.get(e => {
        joi.validate(req.body, schemas.score.list).then(() => {
            e.next();
        }).catch(err => {
            e.throw(new Error('badrequest'));
        });
    }, e => {
        repositories.score.leaders(req.body.userId).then(leaders => {
            e.leaders = leaders;
            e.own = [];

            if (e.leaders.filter(item => {
                return item.userId == req.body.userId;
            }).length > 0)
                e.next("result");
            else
                e.next();
        }).catch(e.throw);
    }, e => {
        repositories.score.own(req.body.userId, e.leaders).then(own => {
            e.own = own;
            if (e.own.length && e.own[0].rank == e.leaders.length + 1) {
                e.leaders = e.leaders.concat(e.own);
                e.own = [];
            }
            e.next();
        }).catch(e.throw);
    }, function result(e) {
        e.done({
            leaders: e.leaders,
            own: e.own
        });
    }).then(data => {
        res.send(models.return({ data: data }));
    }).catch(err => {
        res.send(models.error(req, err));
    });
});

module.exports = router;
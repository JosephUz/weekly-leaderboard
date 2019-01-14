const jueue = require('jueue');
const week = require('week');
const mongo = require('./mongo.js');
const ready = require('../ready');

function yesterday() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    return dateCollection(date);
}

function today() {
    return dateCollection(new Date());
}

function dateCollection(date) {
    return `scores_${date.getFullYear()}_${week(date)}_${date.getDay()}`;
}

function upsert(userId, score) {
    return mongo.process(e => {
        e.db.collection(today()).updateOne({ userId: userId }, {
            $setOnInsert: { userId: userId, rank: null },
            $inc: { score: score }
        }, { upsert: true }).then(() => {
            e.done();
        }).catch(e.throw);
    });
}

function total(date) {
    return mongo.process(e => {
        e.db.collection(dateCollection(date)).aggregate([
            {
                $group: {
                    _id: false,
                    total: { $sum: '$score' }
                }
            }
        ], { allowDiskUse: true }).toArray().then(docs => {
            e.done(((docs[0] || {}).total || 0) * 0.02);
        }).catch(e.throw);
    });
}

function getFirst(date) {
    return mongo.process(e => {
        e.db.collection(dateCollection(date)).find({ rank: 1 }).project({ _id: 0 }).toArray().then(docs => {
            e.done(docs[0]);
        }).catch(e.throw);
    });
}

function top(date) {
    return mongo.process(e => {
        e.db.collection(dateCollection(date)).find({ rank: { $lte: 100 } }).project({ _id: 0 }).toArray().then(docs => {
            e.done(docs[0]);
        }).catch(e.throw);
    });
}

function get(userId) {
    return mongo.process(e => {
        e.db.collection(today()).find({ userId: userId }).project({ _id: 0 }).toArray().then(docs => {
            e.done(docs[0]);
        }).catch(e.throw);
    });
}

function leaders(userId) {
    return mongo.process(e => {
        e.db.collection(today()).aggregate([
            { $sort: { score: -1 } },
            { $limit: 106 },

            {
                $group: {
                    _id: false,
                    user: {
                        $push: {
                            _id: "$_id",
                            userId: "$userId",
                            score: "$score"
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: "$user",
                    includeArrayIndex: "rank"
                }
            },
            {
                $project: {
                    _id: "$user._id",
                    userId: '$user.userId',
                    score: '$user.score',
                    rank: { '$add': ['$rank', 1] }
                }
            },

            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: yesterday(),
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'yesterday'
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$yesterday",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: '$userId',
                    score: '$score',
                    rank: '$rank',
                    money: '$user.money',
                    userName: '$user.userName',
                    age: '$user.age',
                    rankChanges: {
                        $ifNull: [{
                            $cond: {
                                if: {
                                    $eq: ['$yesterday.rank', null]
                                },
                                then: 0,
                                else: {
                                    $subtract: ['$yesterday.rank', '$rank']
                                }
                            }
                        }, 0]
                    }
                }
            }
        ]).toArray().then(docs => {
            var user = docs.filter(doc => {
                return doc.userId == userId;
            })[0];

            if (user) {
                var max = user.rank < 98 || user.rank > 104 ? 101 : user.rank + 3;
                e.done(docs.filter(doc => {
                    return doc.rank < max;
                }));
            } else {
                e.done(docs.filter(doc => {
                    return doc.rank < 101;
                }));
            }
        }).catch(e.throw);
    });
}

function own(userId, leaders) {
    return mongo.process(function setUser(e) {
        get(userId).then(user => {
            e.user = user;
            if (e.user)
                e.next();
            else
                e.done([]);
        }).catch(e.throw);
    }, function beforeCount(e) {
        e.db.collection(today()).find({ score: { $gt: e.user.score } }).count().then(count => {
            e.count = count;
            e.next();
        }).catch(e.throw);
    }, function sameCount(e) {
        e.db.collection(today()).find({ score: e.user.score }).count().then(count => {
            e.sameCount = count;

            e.ninId = leaders.map(doc => {
                return doc.userId;
            });

            e.next();
        }).catch(e.throw);
    }, function setUserRank(e) {
        var query = [];

        if (e.sameCount > leaders.length + 4)
            query.push(
                { $match: { userId: userId } }
            );
        else
            query.push(
                { $match: { score: e.user.score, userId: { $nin: e.ninId } } },
                {
                    $sort: { score: -1 }
                },
                {
                    $group: {
                        _id: false,
                        user: {
                            $push: {
                                _id: "$_id",
                                userId: "$userId",
                                score: "$score"
                            }
                        }
                    }
                },
                {
                    $unwind: {
                        path: "$user",
                        includeArrayIndex: "rank"
                    }
                },
                {
                    $project: {
                        _id: "$user._id",
                        userId: '$user.userId',
                        score: '$user.score',
                        rank: { '$add': ['$rank', 1] }
                    }
                },
                { $match: { userId: userId } },
            );

        query.push(
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: yesterday(),
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'yesterday'
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$yesterday",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: '$userId',
                    score: '$score',
                    rank: { $ifNull: ['$rank', 1] },
                    money: '$user.money',
                    userName: '$user.userName',
                    age: '$user.age',
                    rankChanges: '$yesterday.rank'
                }
            }
        );

        e.db.collection(today()).aggregate(query, { allowDiskUse: true }).toArray().then(docs => {
            e.user = docs[0];
            e.sameRank = e.user.rank;
            e.user.rank += e.count;
            e.user.rank = e.user.rank < leaders.length + 5 ? leaders.length + 5 : e.user.rank;
            e.user.rankChanges = e.user.rankChanges ? e.user.rankChanges - e.user.rank : 0;

            e.before = e.beforeSame = e.afterSame = e.after = [];

            e.beforeCount = 3;
            e.afterCount = 2;

            if (e.sameRank == 1)
                e.next('before');
            else
                e.next();
        }).catch(e.throw);
    }, function beforeSame(e) {
        e.db.collection(today()).aggregate([
            { $match: { score: e.user.score, userId: { $nin: e.ninId.concat([userId]) } } },
            { $limit: e.beforeCount },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: yesterday(),
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'yesterday'
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$yesterday",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: '$userId',
                    score: '$score',
                    money: '$user.money',
                    userName: '$user.userName',
                    age: '$user.age',
                    rankChanges: '$yesterday.rank'
                }
            }
        ], { allowDiskUse: true }).toArray().then(docs => {
            e.beforeSame = docs;
            e.beforeCount -= e.beforeSame.length;
            if (e.beforeCount < 1)
                e.next('afterSame')
            else
                e.next();
        }).catch(e.throw);
    }, function before(e) {
        e.db.collection(today()).aggregate([
            { $match: { score: { $gt: e.user.score } } },
            { $sort: { score: 1 } },
            { $limit: e.beforeCount },
            { $sort: { score: -1 } },

            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: yesterday(),
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'yesterday'
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$yesterday",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: '$userId',
                    score: '$score',
                    money: '$user.money',
                    userName: '$user.userName',
                    age: '$user.age',
                    rankChanges: '$yesterday.rank'
                }
            }
        ]).toArray().then(docs => {
            e.before = docs;
            e.next();
        }).catch(e.throw);
    }, function afterSame(e) {
        e.db.collection(today()).aggregate([
            {
                $match: {
                    score: e.user.score,
                    userId: {
                        $nin: e.ninId.concat(e.beforeSame.map(doc => {
                            return doc.userId;
                        })).concat([userId])
                    }
                }
            },
            { $limit: e.afterCount },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: yesterday(),
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'yesterday'
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$yesterday",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: '$userId',
                    score: '$score',
                    rank: '$rank',
                    money: '$user.money',
                    userName: '$user.userName',
                    age: '$user.age',
                    rankChanges: '$yesterday.rank'
                }
            }
        ], { allowDiskUse: true }).toArray().then(docs => {
            e.afterSame = docs;
            e.afterCount -= e.afterSame.length;
            if (e.afterCount < 1)
                e.next('result');
            else
                e.next();
        }).catch(e.throw);
    }, function after(e) {
        e.db.collection(today()).aggregate([
            { $match: { score: { $lt: e.user.score } } },
            { $sort: { score: -1 } },
            { $limit: e.afterCount },

            {
                $group: {
                    _id: false,
                    user: {
                        $push: {
                            _id: "$_id",
                            userId: "$userId",
                            score: "$score"
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: "$user",
                    includeArrayIndex: "rank"
                }
            },
            {
                $project: {
                    _id: "$user._id",
                    userId: '$user.userId',
                    score: '$user.score',
                    rank: { '$add': ['$rank', 1] }
                }
            },

            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: yesterday(),
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'yesterday'
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$yesterday",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: '$userId',
                    score: '$score',
                    rank: '$rank',
                    money: '$user.money',
                    userName: '$user.userName',
                    age: '$user.age',
                    rankChanges: '$yesterday.rank'
                }
            }
        ]).toArray().then(docs => {
            e.after = docs;
            e.next();
        }).catch(e.throw);
    }, function result(e) {
        var result = [];

        e.before.forEach((doc, i) => {
            doc.rank = e.user.rank - (e.before.length + e.beforeSame.length) + i;
            doc.rankChanges = doc.rankChanges ? doc.rankChanges - doc.rank : 0;
            result.push(doc);
        });

        e.beforeSame.forEach((doc, i) => {
            doc.rank = e.user.rank - e.beforeSame.length + i;
            doc.rankChanges = doc.rankChanges ? doc.rankChanges - doc.rank : 0;
            result.push(doc);
        });

        result.push(e.user);

        e.afterSame.forEach((doc, i) => {
            doc.rank = e.user.rank + i + 1;
            doc.rankChanges = doc.rankChanges ? doc.rankChanges - doc.rank : 0;
            result.push(doc);
        });

        e.after.forEach((doc, i) => {
            doc.rank = e.user.rank + e.afterSame.length + i + 1;
            doc.rankChanges = doc.rankChanges ? doc.rankChanges - doc.rank : 0;
            result.push(doc);
        });

        e.done(result);
    });
}

function exists() {
    return mongo.process(e => {
        e.db.collection(today()).find({}).limit(1).project({ _id: 0 }).toArray().then(docs => {
            e.done(docs.length > 0);
        }).catch(e.throw);
    });
}

function index() {
    return mongo.process(e => {
        e.db.collection(today()).createIndex({ userId: 1 }).then(name => {
            e.next();
        }).catch(e.throw);
    }, e => {
        e.db.collection(today()).createIndex({ rank: 1 }).then(name => {
            e.next();
        }).catch(e.throw);
    }, e => {
        e.db.collection(today()).createIndex({ score: 1 }).then(name => {
            e.done();
        }).catch(e.throw);
    });
}

function setRank(date) {
    return mongo.process(e => {
        e.db.collection(dateCollection(date)).aggregate([
            {
                $sort: { score: -1 },
            },
            {
                $group: {
                    _id: false,
                    user: {
                        $push: {
                            _id: "$_id",
                            userId: "$userId",
                            score: "$score"
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: "$user",
                    includeArrayIndex: "rank"
                }
            },
            {
                $project: {
                    _id: "$user._id",
                    userId: '$user.userId',
                    score: '$user.score',
                    rank: { '$add': ['$rank', 1] }
                }
            },
            {
                $out: dateCollection(date)
            }
        ], { allowDiskUse: true }).toArray().then(() => {
            e.done();
        }).catch(e.throw);
    });
}

function clone() {
    return mongo.process(e => {
        e.db.collection(yesterday()).aggregate([
            {
                $sort: { score: -1 },
            },
            {
                $project: {
                    _id: "$_id",
                    userId: '$userId',
                    score: '$score',
                    rank: { $ifNull: ['$nofield', null] }
                }
            },
            {
                $out: today()
            }
        ], { allowDiskUse: true }).toArray().then(() => {
            e.done();
        }).catch(e.throw);
    });
}

function clear(date) {
    return mongo.process(e => {
        db.collectionNames(dateCollection(date), function (err, names) {
            if (names.length > 0)
                e.next();
            else
                e.done();
        })
    }, e => {
        e.date = new Date(date);
        e.db.collection(dateCollection(date)).drop().then(() => {
            e.next();
        }).catch(err => {
            e.done();
        });
    }, e => {
        e.date.setDate(e.date.getDate() - 1);
        if (e.date.getDay() == 6)
            e.done();
        else
            e.next();
    });
}

module.exports = {
    upsert,
    leaders,
    own,
    index,
    exists,
    total,
    getFirst,
    setRank,
    clone,
    clear,
    top
};
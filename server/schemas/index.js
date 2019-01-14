module.exports = {
    user: {
        add: require('./user/add.schema.js'),
        get: require('./user/get.schema.js')
    },
    score: {
        add: require('./score/add.schema.js'),
        list: require('./score/list.schema.js')
    }
};
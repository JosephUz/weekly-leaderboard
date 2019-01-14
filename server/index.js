const jueue = require('jueue');
const app = require('./app.js');
const config = require('./config');
const repositories = require('./repositories');
const tasks = require('./tasks');

var started = false;

function start() {
    return jueue.promise(e => {
        if (started)
            e.done(app);
        else
            e.next();
    }, e => {
        repositories.user.index().then(() => {
            e.next();
        }).catch(e.throw);
    }, e => {
        tasks.start().then(() => {
            e.next();
        }).catch(e.throw);
    }, e => {
        app.listen(config.port, () => {
            console.log(`server started on port ${config.port}!`);
            started = true;
            e.done(app);
        });
    });
}

if (process.env.START == "on")
    start();

module.exports = {
    start,
    app
}
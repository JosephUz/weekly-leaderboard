const server = require('./server');
const simulation = require('./simulation');

simulation.start().then(() => {
    server.start().then(() => {
        simulation.tasks.start();
    });
});
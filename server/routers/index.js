const path = require('path');
const fs = require('fs');

function set(app) {
    fs.readdirSync(__dirname).forEach(file => {
        if (file.indexOf('.router.js') > -1)
            app.use('/' + path.basename(file, ".router.js"), require(path.join(__dirname, file)));
    });
}

module.exports = {
    set
}
var path = require('path');

module.exports = {
    entry: './client/scripts/matrix.js',
    output: {
        filename: 'matrix.js',
        path: path.join(__dirname, './client/public/scripts/dist')
    }
};
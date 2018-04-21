const fs = require('fs');

function getBannedIps() {
    var buffer = fs.readFileSync('./data/banned.json');
    try {
        var json = JSON.parse(buffer);
        return json.bannedIps;
    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = {
    getBannedIps
};
const fs = require('fs');
const path = require('path');

function getBannedIps() {
    var buffer = fs.readFileSync(path.join(__dirname, './data/banned.json'));
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
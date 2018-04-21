const fs = require('fs');
const path = require('path');

const banned = path.join(__dirname, './data/banned.json');

function getBannedIps() {
    var buffer = fs.readFileSync(banned);
    try {
        var json = JSON.parse(buffer);
        return json.bannedIps;
    } catch (error) {
        console.error('Error:', error);
    }
}

function addBannedIp(ip) {
    var buffer = fs.readFileSync(banned);
    try {
        var json = JSON.parse(buffer);
        json.bannedIps.push(ip);
        fs.writeFileSync(banned, JSON.stringify(json));
    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = {
    getBannedIps,
    addBannedIp
};
const fs = require('fs');
const path = require('path');

const banned = path.join(__dirname, './data/banned.json');

var bannedIps = [];

load();

function load() {
    var buffer = fs.readFileSync(banned);
    try {
        var json = JSON.parse(buffer);
        bannedIps = json.bannedIps;
    } catch (error) {
        console.error('Error:', error);
    }
}

function save() {
    try {
        fs.writeFileSync(banned, JSON.stringify({
            bannedIps
        }, null, 4));
    } catch (error) {
        console.error('Error:', error);
    }
}

function add(ip) {
    if (!isBanned(ip)) {
        bannedIps.push(ip);
        bannedIps.sort();
        save();
    }
}

function isBanned(ip) {
    return bannedIps.includes(ip);
}

module.exports = {
    add,
    isBanned
};
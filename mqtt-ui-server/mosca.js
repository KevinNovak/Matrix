const mosca = require('mosca');
const pmx = require('pmx');
const validate = require('./validate');
const bans = require('./bans');
const topics = require('./data/topics');
const state = require('./data/state');

const mongoDbUrl = 'mongodb://localhost:27017/matrix';
const mqttPort = 1883;
const wsPort = 82;

var server;

var moscaSettings = {
    port: mqttPort,
    backend: {
        type: 'mongo',
        url: mongoDbUrl,
        pubsubCollection: 'ascoltatori',
        mongo: {}
    },
    http: {
        port: wsPort,
        bundle: true,
        static: './'
    }
};

function usersChanged() {
    var online = Object.keys(server.clients)
        .filter(c => c.startsWith('mqttjs')).length;
    state.online = online;
    var message = {
        topic: topics.ONLINE,
        payload: JSON.stringify({
            online
        }),
        qos: 0,
        retain: false
    };
    server.publish(message);
}

function isValidClient(client) {
    return client &&
        client.connection &&
        client.connection.stream &&
        client.connection.stream.socket &&
        client.connection.stream.socket.upgradeReq &&
        client.connection.stream.socket.upgradeReq.headers;
}

function getIp(client) {
    if (isValidClient(client)) {
        return client.connection.stream.socket.upgradeReq.headers['x-real-ip'];
    }
}

function handleTopic(topic, payload) {
    switch (topic) {
        case topics.LED:
            try {
                payload = JSON.parse(payload);
                if (validate.isLedTopic(payload)) {
                    state.setLedById(payload.ledId, payload.color);
                }
            } catch (error) {
                console.error('Error:', error);
            }
            break;
        case topics.CLEAR:
            state.clearAll();
            break;
        case topics.SET:
            try {
                payload = JSON.parse(payload);
                if (validate.isSetTopic(payload)) {
                    state.setAll(payload.color);
                }
            } catch (error) {
                console.error('Error:', error);
            }
            break;
        default:
            break;
    }
}

function start() {
    server = new mosca.Server(moscaSettings);

    // Client connects
    server.on('clientConnected', (client) => {
        var ip = getIp(client);
        if (ip) {
            if (bans.isBanned(ip)) {
                client.close();
                console.log(`MQTT: IP "${ip}" connected but is banned.`);
            } else {
                console.log(`MQTT: IP "${ip}" connected.`);
            }
        }
        usersChanged();
    });

    // Client disconnects
    server.on('clientDisconnected', (client) => {
        var ip = getIp(client);
        if (ip) {
            console.log(`MQTT: IP "${ip}" disconnected.`);
        }
        usersChanged();
    });

    // Message recieved
    server.on('published', (packet, client) => {
        var ip = getIp(client);
        if (ip) {
            var topic = packet.topic;
            var payload = packet.payload;
            console.log(`MQTT: IP "${ip}" published to "${topic}".`);
            handleTopic(topic, payload);
        }
    });

    // Server started
    server.on('ready', () => {
        console.log(`Mosca server running with MQTT on port ${mqttPort} and WebSockets on port ${wsPort}.`);
    });

    server.on('error', (error) => {
        console.error('Error:', error.message);
        process.exit();
    });

    return server;
};

function formatIps(ips) {
    // Count duplicates
    var counts = {};
    ips.forEach((ip) => {
        counts[ip] = (counts[ip] || 0) + 1;
    });

    // Remove duplicates
    ips = Array.from(new Set(ips));

    // Format
    ips.sort();
    ips = ips.map(ip => `${ip} (${counts[ip]})`);

    return ips;
}

pmx.action('online', (reply) => {
    var ips = [];
    var clients = server.clients;
    for (var clientKey in clients) {
        if (clients.hasOwnProperty(clientKey)) {
            var client = clients[clientKey];
            var ip = getIp(client);
            if (ip) {
                ips.push(ip);
            }
        }
    }
    ips = formatIps(ips);
    reply({
        ips
    });
});

pmx.action('ban', (ip, reply) => {
    var success = false;
    var clients = server.clients;
    for (var clientKey in clients) {
        if (clients.hasOwnProperty(clientKey)) {
            var client = clients[clientKey];
            if (getIp(client) == ip) {
                bans.add(ip);
                client.close();
                success = true;
                console.log(`MQTT: Banned IP "${ip}"`);
            }
        }
    }
    reply({
        success,
        ip
    });
});

module.exports = {
    start
};
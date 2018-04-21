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

pmx.action('online', (reply) => {
    var ips = [];
    var clients = server.clients;
    for (var clientKey in clients) {
        if (clients.hasOwnProperty(clientKey)) {
            var client = clients[clientKey];
            var ip = getIp(client);
            if (ip && ip != "Unknown") {
                ips.push(ip);
            }
        }
    }
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

function getIp(client) {
    var ip;
    try {
        ip = client.connection.stream.socket.upgradeReq.headers['x-real-ip'];
    } catch (error) {
        console.error('Error:', error);
        ip = "Unknown";
    }
    return ip;
}

function isBanned(ip) {
    var bannedIps = bans.getBannedIps();
    if (bannedIps.includes(ip)) {
        return true;
    }
    return false;
}

function start() {
    server = new mosca.Server(moscaSettings);

    // Client connects
    server.on('clientConnected', (client) => {
        if (client.connection.stream.socket) {
            var ip = getIp(client);
            if (isBanned(ip)) {
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
        if (client.connection.stream.socket) {
            var ip = getIp(client);
            console.log(`MQTT: IP "${ip}" disconnected.`);
        }
        usersChanged();
    });

    // Message recieved
    server.on('published', (packet, client) => {
        var topic = packet.topic;
        if (!topic.startsWith('$SYS/') && client) {
            //console.log(`  Topic: ${packet.topic}`);
            //console.log(`  Payload: ${packet.payload}`);
            var ip = client.connection.stream.socket.upgradeReq.headers['x-real-ip'];
            console.log(`MQTT: IP "${ip}" published to "${topic}".`);
            switch (topic) {
                case topics.LED:
                    try {
                        var payload = JSON.parse(packet.payload);
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
                        var payload = JSON.parse(packet.payload);
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

module.exports = {
    start
};
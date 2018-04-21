const mosca = require('mosca');
const validate = require('./validate');
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

function start() {
    server = new mosca.Server(moscaSettings);

    // Client connects
    server.on('clientConnected', (client) => {
        usersChanged();
        console.log(`Client "${client.id}" connected.`);
    });

    // Client disconnects
    server.on('clientDisconnected', (client) => {
        usersChanged();
        console.log(`Client "${client.id}" disconnected.`);
    });

    // Message recieved
    server.on('published', (packet, client) => {
        var topic = packet.topic;
        if (!topic.startsWith('$SYS/') && client) {
            //console.log(`  Topic: ${packet.topic}`);
            //console.log(`  Payload: ${packet.payload}`);
            var ip = client.connection.stream.socket.upgradeReq.headers['x-real-ip'];
            console.log(`IP: ${ip} published Topic: ${topic}.`);
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
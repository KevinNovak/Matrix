const mosca = require('mosca');
const state = require('./state.js');

const mongoDbUrl = 'mongodb://localhost:27017/matrix';
const mqttPort = 1883;
const wsPort = 80;

const ledTopic = 'matrix/led';
const clearTopic = 'matrix/clear';
const setTopic = 'matrix/set';

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

var start = () => {
    var server = new mosca.Server(moscaSettings);

    // Client connects
    server.on('clientConnected', (client) => {
        console.log(`Client "${client.id}" connected.`);
    });

    // Client disconnects
    server.on('clientDisconnected', (client) => {
        console.log(`Client "${client.id}" disconnected.`);
    });

    // Message recieved
    server.on('published', (packet, client) => {
        var topic = packet.topic;
        if (!topic.startsWith('$SYS/')) {
            console.log(`  Topic: ${packet.topic}`);
            console.log(`  Payload: ${packet.payload}`);
            switch (topic) {
                case ledTopic:
                    var payload = JSON.parse(packet.payload);
                    state.setLedById(payload.ledId, payload.color);
                    break;
                case clearTopic:
                    state.clearAll();
                    break;
                case setTopic:
                    var payload = JSON.parse(packet.payload);
                    state.setAll(payload.color);
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

    return server;
};

module.exports = {
    start
};
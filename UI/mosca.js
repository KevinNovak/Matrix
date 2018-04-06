const mosca = require('mosca');
const validate = require('./validate');
const state = require('./state');

const mongoDbUrl = 'mongodb://localhost:27017/matrix';
const mqttPort = 1883;
const wsPort = 81;

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

function start() {
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
                    try {
                        var payload = JSON.parse(packet.payload);
                        if (validate.isLedTopic(payload)) {
                            state.setLedById(payload.ledId, payload.color);
                        }
                    } catch (error) {
                        console.error(error);
                    }
                    break;
                case clearTopic:
                    state.clearAll();
                    break;
                case setTopic:
                    try {
                        var payload = JSON.parse(packet.payload);
                        if (validate.isSetTopic(payload)) {
                            state.setAll(payload.color);
                        }
                    } catch (error) {
                        console.error(error);
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
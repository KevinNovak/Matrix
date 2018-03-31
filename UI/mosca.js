const mosca = require('mosca');

const mongoDbUrl = 'mongodb://localhost:27017/matrix';
const mqttPort = 1883;
const wsPort = 80;

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
        var message = {
            topic: 'matrix/state',
            payload: JSON.stringify(currentState)
        };
        server.publish(message, client);
    });

    // Client disconnects
    server.on('clientDisconnected', (client) => {
        console.log(`Client "${client.id}" disconnected.`);
    });

    // Message recieved
    server.on('published', (packet, client) => {
        if (!packet.topic.startsWith('$SYS/')) {
            console.log(`  Topic: ${packet.topic}`);
            console.log(`  Payload: ${packet.payload}`);
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

var currentState = {
    "led-0-0": "color-16",
    "led-0-1": "color-16",
    "led-0-2": "color-16",
    "led-0-3": "color-16",
    "led-0-4": "color-16",
    "led-0-5": "color-16",
    "led-0-6": "color-16",
    "led-0-7": "color-16",

    "led-1-0": "color-16",
    "led-1-1": "color-16",
    "led-1-2": "color-16",
    "led-1-3": "color-16",
    "led-1-4": "color-16",
    "led-1-5": "color-16",
    "led-1-6": "color-16",
    "led-1-7": "color-16",

    "led-2-0": "color-16",
    "led-2-1": "color-16",
    "led-2-2": "color-16",
    "led-2-3": "color-16",
    "led-2-4": "color-16",
    "led-2-5": "color-16",
    "led-2-6": "color-16",
    "led-2-7": "color-16",

    "led-3-0": "color-16",
    "led-3-1": "color-16",
    "led-3-2": "color-16",
    "led-3-3": "color-16",
    "led-3-4": "color-16",
    "led-3-5": "color-16",
    "led-3-6": "color-16",
    "led-3-7": "color-16",

    "led-4-0": "color-16",
    "led-4-1": "color-16",
    "led-4-2": "color-16",
    "led-4-3": "color-16",
    "led-4-4": "color-16",
    "led-4-5": "color-16",
    "led-4-6": "color-16",
    "led-4-7": "color-16",

    "led-5-0": "color-16",
    "led-5-1": "color-16",
    "led-5-2": "color-16",
    "led-5-3": "color-16",
    "led-5-4": "color-16",
    "led-5-5": "color-16",
    "led-5-6": "color-16",
    "led-5-7": "color-16",

    "led-6-0": "color-16",
    "led-6-1": "color-16",
    "led-6-2": "color-16",
    "led-6-3": "color-16",
    "led-6-4": "color-16",
    "led-6-5": "color-16",
    "led-6-6": "color-16",
    "led-6-7": "color-16",

    "led-7-0": "color-16",
    "led-7-1": "color-16",
    "led-7-2": "color-16",
    "led-7-3": "color-16",
    "led-7-4": "color-16",
    "led-7-5": "color-16",
    "led-7-6": "color-16",
    "led-7-7": "color-16",
};
const express = require('express');
const raspividStream = require('raspivid-stream');

const wsPort = 8082;

const videoWidth = 960;
const videoHeight = 540;
const videoRotation = 0;

// App setup
var app = express();
var wss = require('express-ws')(app);

app.ws('/matrix/stream', (ws, request) => {
    console.log('Client connected.');

    ws.send(JSON.stringify({
        action: 'init',
        width: videoWidth,
        height: videoHeight
    }));

    var stream = raspividStream({
        rotation: videoRotation
    });

    stream.on('data', (data) => {
        ws.send(data, {
            binary: true
        }, (error) => {
            if (error) {
                console.error(error);
            };
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        stream.removeAllListeners('data');
    });
});

// Start server
var server = app.listen(wsPort, () => {
    console.log(`Server started on port ${wsPort}`);
});

process.on('uncaughtException', (error) => {
    console.error('Error:', error.message);
});
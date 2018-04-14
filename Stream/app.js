const express = require('express');
const raspividStream = require('raspivid-stream');
const cors = require('cors');

const wsPort = 8082;

// App setup
const app = express();
const wss = require('express-ws')(app);

// Setup cors
app.use(cors());

app.ws('/matrix/stream', (ws, request) => {
    console.log('Client connected.');

    ws.send(JSON.stringify({
        action: 'init',
        width: '960',
        height: '540'
    }));

    var videoStream = raspividStream({
        rotation: 180
    });

    videoStream.on('data', (data) => {
        ws.send(data, {
            binary: true
        }, (error) => {
            if (error) console.error(error);
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        videoStream.removeAllListeners('data');
    });
});

// Start server
var server = app.listen(httpPort, () => {
    console.log(`Server started on port ${wsPort}`);
});
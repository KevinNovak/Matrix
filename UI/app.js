const express = require('express');
const path = require('path');
const mosca = require('./mosca.js');
const state = require('./state.js');

const httpPort = 3000;

// Start mosca broker
mosca.start();

// App setup
var app = express();

// Static files
app.use(express.static(path.join(__dirname, './public')));

app.get('/api/state', function (request, response) {
    var body = state.currentState;
    response.status(200);
    response.json(body);
});

// Start server
var server = app.listen(httpPort, () => {
    console.log(`Server started on port ${httpPort}`);
});
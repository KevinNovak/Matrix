const express = require('express');
const hbs = require('hbs');
const path = require('path');
const mosca = require('./mosca.js');
const state = require('./state.js');

const httpPort = 3000;

// Start mosca broker
mosca.start();

// App setup
var app = express();

// Handlebars
app.set('view engine', 'hbs');

// Static files
app.use(express.static(path.join(__dirname, './public')));

app.get('/', (request, response) => {
    response.render('index.hbs');
});

app.get('/api/state', (request, response) => {
    var body = state.leds;
    response.status(200);
    response.json(body);
});

// Start server
var server = app.listen(httpPort, () => {
    console.log(`Server started on port ${httpPort}`);
});
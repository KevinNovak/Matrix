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
    response.render('index.hbs', {
        leds: state.leds,
        colors: colors
    });
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

var colors = [
    "color-1",
    "color-2",
    "color-3",
    "color-4",
    "color-5",
    "color-6",
    "color-7",
    "color-8",
    "color-9",
    "color-10",
    "color-11",
    "color-12",
    "color-13",
    "color-14",
    "color-15",
    "color-16",
    "color-17",
    "color-18"
];
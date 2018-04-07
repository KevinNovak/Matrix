const express = require('express');
const cors = require('cors');
const hbs = require('hbs');
const path = require('path');
const mosca = require('./mosca');
const state = require('./state');
const colors = require('./colors');

const httpPort = 3000;

// Start mosca broker
mosca.start();

// App setup
var app = express();

// Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './views'));

// Static files
app.use(express.static(path.join(__dirname, './public')));

// Setup cors
app.use(cors());

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
const express = require('express');
const cors = require('cors');
const hbs = require('hbs');
const path = require('path');
const bans = require('./bans');
const mosca = require('./mosca');
const state = require('./data/state');
const colors = require('./data/colors');

const httpPort = 3000;

// Start mosca broker
mosca.start();

// App setup
var app = express();

// Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './client/views'));
hbs.registerPartials(path.join(__dirname, './client/views/partials'));

// Static files
app.use(express.static(path.join(__dirname, './client/public')));

// Setup cors
app.use(cors());

var verifyClient = (request, response, next) => {
    var ip = request.get('x-real-ip');
    var bannedIps = bans.getBannedIps();
    if (bannedIps.includes(ip)) {
        console.log(`IP ${ip} tried to connect via HTTP but is banned.`);
        response.status(401).send('Unauthorized');
    } else {
        next();
    }
};

// Verify clients
app.use(verifyClient);

app.get('/', (request, response) => {
    var ip = request.get('x-real-ip');
    console.log(`IP: ${ip} connected to the Matrix.`);
    year = new Date().getFullYear();
    response.render('index.hbs', {
        leds: state.leds,
        colors,
        year
    });
});

app.get('/api/state', (request, response) => {
    var body = {
        leds: state.leds,
        online: state.online
    };
    response.status(200);
    response.json(body);
});

// Start server
var server = app.listen(httpPort, () => {
    console.log(`Server started on port ${httpPort}`);
});
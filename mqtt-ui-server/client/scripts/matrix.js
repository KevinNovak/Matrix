const topics = require('./topics');

// Local
const apiUrl = 'http://localhost:3000/api';
const wsUrl = 'ws://localhost:82';

// Local Network
//const apiUrl = 'http://192.168.0.32:3000/api';
//const wsUrl = 'ws://192.168.0.32:82';

// Public
//const apiUrl = 'http://kevinnovak.me/matrix/api';
//const wsUrl = 'ws://kevinnovak.me/matrix/ws';
const streamUrl = 'ws://pi.kevinnovak.me:8082/matrix/stream';

const clearColor = 'color-18';

var editingEnabled = false;

var client;
var ledButtons, colorButtons, clearButton, setButton;
var activeColorButton;
var onlineSpan;
var liveStreamCanvas;

document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
        setupClient();
        selectElements();
        registerEvents();
        activeColorButton = colorButtons[0];
        startStream();
    }
};

function selectElements() {
    ledButtons = document.getElementsByClassName('btn led');
    colorButtons = document.getElementsByClassName('btn color');
    setButton = document.getElementById('control-set');
    clearButton = document.getElementById('control-clear');
    onlineSpan = document.getElementById('online');
    liveStreamCanvas = document.getElementById('live-stream');
}

function registerEvents() {
    for (ledButton of ledButtons) {
        ledButton.addEventListener('click', ledClicked);
    }
    for (colorButton of colorButtons) {
        colorButton.addEventListener('click', colorClicked);
    }
    setButton.addEventListener('click', setAllClicked);
    clearButton.addEventListener('click', clearAllClicked);
}

function startStream() {
    var player = new WSAvcPlayer(liveStreamCanvas, 'webgl');
    player.connect(streamUrl);
}

// ==============================================
// Colors
// ==============================================
function colorClicked() {
    setActive(this);
}

function setActive(colorButton) {
    if (activeColorButton) {
        activeColorButton.classList.remove('active');
    }
    activeColorButton = colorButton;
    activeColorButton.classList.add('active');
}

// ==============================================
// LEDs
// ==============================================
function ledClicked() {
    if (editingEnabled) {
        var color = activeColorButton.id;
        if (!ledContainsColor(this, color)) {
            setLed(this, color);
            publishLed(this.id, color);
        }
    }
}

function setLedById(ledId, color) {
    var ledButton = document.getElementById(ledId);
    if (!ledContainsColor(ledButton, color)) {
        setLed(ledButton, color);
    }
}

function setLed(ledButton, color) {
    removeLedColors(ledButton);
    ledButton.classList.add(color);
}

function publishLed(ledId, color) {
    var payload = JSON.stringify({
        ledId,
        color
    });

    client.publish(topics.LED, payload);
}

// ==============================================
// Set all
// ==============================================
function setAllClicked() {
    if (editingEnabled) {
        var color = activeColorButton.id;
        setAll(color);
        publishSet(color);
    }
}

function setAll(color) {
    for (ledButton of ledButtons) {
        if (!ledContainsColor(ledButton, color)) {
            setLed(ledButton, color);
        }
    }
}

function publishSet(color) {
    var payload = JSON.stringify({
        color
    });

    client.publish(topics.SET, payload);
}

// ==============================================
// Clear all
// ==============================================
function clearAllClicked() {
    if (editingEnabled) {
        clearAll();
        publishClear();
    }
}

function clearAll() {
    for (ledButton of ledButtons) {
        if (!ledContainsColor(ledButton, clearColor)) {
            setLed(ledButton, clearColor);
        }
    }
}

function publishClear() {
    client.publish(topics.CLEAR);
}

// ==============================================
// Online
// ==============================================
function setOnline(online) {
    onlineSpan.innerHTML = online;
}

// ==============================================
// Helpers
// ==============================================
function ledContainsColor(ledButton, color) {
    return ledButton.classList.contains(color);
}

function removeLedColors(ledButton) {
    var regex = new RegExp(/\bcolor-[\d]+\b/, 'g');
    ledButton.className = ledButton.className.replace(regex, '');
}

// ==============================================
// API
// ==============================================
function setState() {
    fetch(apiUrl + '/state')
        .then((response) => {
            return response.json();
        })
        .then((state) => {
            setOnline(state.online);
            for (led of state.leds) {
                setLedById(led.ledId, led.color);
            }
            editingEnabled = true;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// ==============================================
// Mosca
// ==============================================
// Connect to the MQTT Broker over WebSockets
// The port here is the "http" port we specified on the MQTT Broker
function setupClient() {
    client = mqtt.connect(wsUrl);

    client.on('connect', () => {
        console.log('Connected to MQTT Broker.');
        subscribe();
        setState();
    });

    client.on('close', () => {
        editingEnabled = false;
        console.log('Disconnected from MQTT Broker.');
    });

    // Message recieved
    client.on('message', (topic, payload) => {
        switch (topic) {
            case topics.LED:
                try {
                    payload = JSON.parse(payload);
                    setLedById(payload.ledId, payload.color);
                } catch (error) {
                    console.error('Error:', error);
                }
                break;
            case topics.CLEAR:
                clearAll();
                break;
            case topics.SET:
                try {
                    payload = JSON.parse(payload);
                    setAll(payload.color);
                } catch (error) {
                    console.error('Error:', error);
                }
                break;
            case topics.ONLINE:
                try {
                    payload = JSON.parse(payload);
                    setOnline(payload.online);
                } catch (error) {
                    console.error('Error:', error);
                }
            default:
                break;
        }
    });
}

function subscribe() {
    for (var topic in topics) {
        client.subscribe(topics[topic]);
    }
}
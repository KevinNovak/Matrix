var ledButtons, colorButtons, clearButton, setButton;
var activeColorButton;

window.onload = () => {
    // Select elements
    ledButtons = document.getElementsByClassName('btn led');
    colorButtons = document.getElementsByClassName('btn color');
    clearButton = document.getElementById('control-clear');
    setButton = document.getElementById('control-set');

    // Register events
    for (ledButton of ledButtons) {
        ledButton.addEventListener('click', ledClicked);
    }
    for (colorButton of colorButtons) {
        colorButton.addEventListener('click', colorClicked);
    }
    clearButton.addEventListener('click', clearAll);
    setButton.addEventListener('click', setAll);

    setActive(colorButtons[0]);
};

function ledClicked() {
    console.log(`${this.id} clicked!`);
    var color = colors[activeColorButton.id];
    this.style["background-color"] = color;
    publishLedChange(this.id, color);
}

function colorClicked() {
    console.log(`${this.id} clicked!`);
    setActive(this);
}

function setActive(colorButton) {
    if (activeColorButton) {
        activeColorButton.classList.remove('active');
    }
    activeColorButton = colorButton;
    activeColorButton.classList.add('active');
}

function clearAll() {
    console.log('Clearing all leds');
    for (ledButton of ledButtons) {
        ledButton.style["background-color"] = colors["color-16"];
    }
}

function setAll() {
    console.log('Setting all leds');
    for (ledButton of ledButtons) {
        ledButton.style["background-color"] = colors[activeColorButton.id];
    }
}

var colors = {
    "color-1": "#b21f35",
    "color-2": "#d82735",
    "color-3": "#ff7435",
    "color-4": "#ffa135",
    "color-5": "#ffcb35",
    "color-6": "#fff735",
    "color-7": "#00753a",
    "color-8": "#009e47",
    "color-9": "#16dd36",
    "color-10": "#0052a5",
    "color-11": "#0079e7",
    "color-12": "#06a9fc",
    "color-13": "#681e7e",
    "color-14": "#7d3cb5",
    "color-15": "#bd7af6",
    "color-16": "#dddddd"
};

// Connect to the MQTT Broker over WebSockets
// The port here is the "http" port we specified on the MQTT Broker
var client = mqtt.connect('ws://localhost:8080');

// Subscribe to the "mqtt/demo" topic
// (The same one we are publishing to for this example)
client.subscribe('matrix/led');

// Message recieved
client.on('message', (topic, payload) => {
    // Log message
    console.log(`  Topic: ${topic}`);
    console.log(`  Payload: ${payload}`);

    if (topic === 'matrix/led') {
        payload = JSON.parse(payload);
        setLed(payload.ledId, payload.color);
    }
});

client.on('connect', () => {
    console.log('Connected to MQTT Broker.');
});

client.on('close', () => {
    console.log('Disconnected from MQTT Broker.');
});

function setLed(ledId, color) {
    var ledButton = document.getElementById(ledId);
    ledButton.style['background-color'] = color;
}

function publishLedChange(ledId, color) {
    var payload = JSON.stringify({
        ledId,
        color
    });

    client.publish('matrix/led', payload);
}

// // Close the connection
// client.end();
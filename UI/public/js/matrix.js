var ledButtons, colorButtons, clearButton, setButton;
var activeColorButton;

const clearColor = 'color-16';

document.onreadystatechange = () => {
    // Select elements
    ledButtons = document.getElementsByClassName('btn led');
    colorButtons = document.getElementsByClassName('btn color');
    setButton = document.getElementById('control-set');
    clearButton = document.getElementById('control-clear');

    // Register events
    for (ledButton of ledButtons) {
        ledButton.addEventListener('click', ledClicked);
    }
    for (colorButton of colorButtons) {
        colorButton.addEventListener('click', colorClicked);
    }
    setButton.addEventListener('click', setAllClicked);
    clearButton.addEventListener('click', clearAllClicked);

    setActive(colorButtons[0]);
};

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
    var color = activeColorButton.id;
    setLed(this, color);
    publishLed(this.id, color);
}

function setLedById(ledId, color) {
    var ledButton = document.getElementById(ledId);
    setLed(ledButton, color);
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

    client.publish('matrix/led', payload);
}

// ==============================================
// Set all
// ==============================================
function setAllClicked() {
    var color = activeColorButton.id;
    setAll(color);
    publishSet(color);
}

function setAll(color) {
    for (ledButton of ledButtons) {
        setLed(ledButton, color);
    }
}

function publishSet(color) {
    var payload = JSON.stringify({
        color
    });

    client.publish('matrix/set', payload);
}

// ==============================================
// Clear all
// ==============================================
function clearAllClicked() {
    clearAll();
    publishClear();
}

function clearAll() {
    for (ledButton of ledButtons) {
        setLed(ledButton, clearColor);
    }
}

function publishClear() {
    client.publish('matrix/clear');
}

// ==============================================
// Helpers
// ==============================================
function removeLedColors(ledButton) {
    var regex = new RegExp('color\-[\\d]+', 'g');
    ledButton.className = ledButton.className.replace(regex, '');
}

// ==============================================
// Mosca
// ==============================================
// Connect to the MQTT Broker over WebSockets
// The port here is the "http" port we specified on the MQTT Broker
//var client = mqtt.connect('ws://192.168.0.27:80');
var client = mqtt.connect('ws://localhost:80');

// Subscribe to the "mqtt/demo" topic
// (The same one we are publishing to for this example)
client.subscribe('matrix/led');
client.subscribe('matrix/clear');
client.subscribe('matrix/set');

client.on('connect', () => {
    console.log('Connected to MQTT Broker.');
});

client.on('close', () => {
    console.log('Disconnected from MQTT Broker.');
});

// Message recieved
client.on('message', (topic, payload) => {
    // Log message
    console.log(`  Topic: ${topic}`);
    console.log(`  Payload: ${payload}`);

    switch (topic) {
        case 'matrix/led':
            payload = JSON.parse(payload);
            setLedById(payload.ledId, payload.color);
            break;
        case 'matrix/clear':
            clearAll();
            break;
        case 'matrix/set':
            payload = JSON.parse(payload);
            setAll(payload.color);
        default:
            break;
    }
});

// // Close the connection
// client.end();
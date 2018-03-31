var ledButtons, colorButtons, clearButton, setButton;
var activeColorButton;

const clearColor = 'color-16';

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
    clearButton.addEventListener('click', clearAllClicked);
    setButton.addEventListener('click', setAllClicked);

    setActive(colorButtons[0]);
};

function ledClicked() {
    console.log(`${this.id} clicked!`);
    var color = activeColorButton.id;
    setLedColor(this, color);
    publishLed(this.id, color);
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

function setAllClicked() {
    var color = activeColorButton.id;
    setAll(color);
    publishSetAll(color);
}

function clearAllClicked() {
    clearAll();
    publishClear();
}

function clearAll() {
    console.log('Clearing all leds');
    for (ledButton of ledButtons) {
        setLedColor(ledButton, clearColor);
    }
}

function setAll(color) {
    console.log('Setting all leds');
    for (ledButton of ledButtons) {
        setLedColor(ledButton, color);
    }
}

// Connect to the MQTT Broker over WebSockets
// The port here is the "http" port we specified on the MQTT Broker
//var client = mqtt.connect('ws://192.168.0.27:80');
var client = mqtt.connect('ws://localhost:80');

// Subscribe to the "mqtt/demo" topic
// (The same one we are publishing to for this example)
client.subscribe('matrix/led');
client.subscribe('matrix/clear');
client.subscribe('matrix/set');

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

client.on('connect', () => {
    console.log('Connected to MQTT Broker.');
});

client.on('close', () => {
    console.log('Disconnected from MQTT Broker.');
});

function setLedById(ledId, color) {
    var ledButton = document.getElementById(ledId);
    setLedColor(ledButton, color);
}

function publishLed(ledId, color) {
    var payload = JSON.stringify({
        ledId,
        color
    });

    client.publish('matrix/led', payload);
}

function publishClear() {
    client.publish('matrix/clear');
}

function publishSetAll(color) {
    var payload = JSON.stringify({
        color
    });

    client.publish('matrix/set', payload);
}

function setLedColor(ledButton, color) {
    removeLedColors(ledButton);
    ledButton.classList.add(color);
}

function removeLedColors(ledButton) {
    var regex = new RegExp('color\-[\\d]+', 'g');
    ledButton.className = ledButton.className.replace(regex, '');
}

// // Close the connection
// client.end();
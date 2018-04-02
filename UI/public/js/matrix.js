// Local
const apiUrl = 'http://localhost:3000/api';
const wsUrl = 'ws://localhost:80';
// Network
//const apiUrl = 'http://192.168.0.27:3000/api';
//const wsUrl = 'ws://192.168.0.27:80';

const ledTopic = 'matrix/led';
const clearTopic = 'matrix/clear';
const setTopic = 'matrix/set';

const clearColor = 'color-20';

var client;
var ledButtons, colorButtons, clearButton, setButton;
var activeColorButton;

document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
        setup();
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
    }
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
    if (!ledContainsColor(this, color)) {
        setLed(this, color);
        publishLed(this.id, color);
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

    client.publish(ledTopic, payload);
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
        if (!ledContainsColor(ledButton, color)) {
            setLed(ledButton, color);
        }
    }
}

function publishSet(color) {
    var payload = JSON.stringify({
        color
    });

    client.publish(setTopic, payload);
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
        if (!ledContainsColor(ledButton, clearColor)) {
            setLed(ledButton, clearColor);
        }
    }
}

function publishClear() {
    client.publish(clearTopic);
}

// ==============================================
// Helpers
// ==============================================
function ledContainsColor(ledButton, color) {
    return ledButton.classList.contains(color);
}

function removeLedColors(ledButton) {
    var regex = new RegExp('color\-[\\d]+', 'g');
    ledButton.className = ledButton.className.replace(regex, '');
}

// ==============================================
// API
// ==============================================
function setState() {
    var request = new XMLHttpRequest();
    request.open('GET', apiUrl + '/state', true);
    request.onload = (e) => {
        if (request.readyState === 4) {
            if (request.status === 200) {
                var leds = JSON.parse(request.responseText);
                console.log(leds);
                for (led of leds) {
                    setLedById(led.ledId, led.color);
                }
            } else {
                console.error(response.statusText);
            }
        }
    };
    request.onerror = (e) => {
        console.error(response.statusText);
    };
    request.send(null);
}

// ==============================================
// Mosca
// ==============================================
// Connect to the MQTT Broker over WebSockets
// The port here is the "http" port we specified on the MQTT Broker
function setup() {
    client = mqtt.connect(wsUrl);

    // Subscribe to the "mqtt/demo" topic
    // (The same one we are publishing to for this example)
    client.subscribe(ledTopic);
    client.subscribe(clearTopic);
    client.subscribe(setTopic);

    client.on('connect', () => {
        console.log('Connected to MQTT Broker.');
        setState();
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
            case ledTopic:
                payload = JSON.parse(payload);
                setLedById(payload.ledId, payload.color);
                break;
            case clearTopic:
                clearAll();
                break;
            case setTopic:
                payload = JSON.parse(payload);
                setAll(payload.color);
                break;
            default:
                break;
        }
    });
}
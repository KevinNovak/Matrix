const leds = require('./data/leds').leds;
const colors = require('./data/colors').colors;

function isLed(led) {
    return leds.includes(led);
}

function isColor(color) {
    return colors.includes(color);
}

function isLedTopic(payload) {
    if (payload.ledId && payload.color) {
        if (isLed(payload.ledId) && isColor(payload.color)) {
            return true;
        }
    }
    return false;
}

function isSetTopic(payload) {
    if (payload.color) {
        if (isColor(payload.color)) {
            return true;
        }
    }
    return false;
}

module.exports = {
    isLedTopic,
    isSetTopic
};
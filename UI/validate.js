const leds = require('./leds');
const colors = require('./colors');

function isLed(led) {
    return leds.includes(led);
}

function isColor(color) {
    return colors.includes(color);
}

module.exports = {
    isLed,
    isColor
};
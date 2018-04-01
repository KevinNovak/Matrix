const clearColor = "color-16";

function setLedById(ledId, color) {
    for (led of leds) {
        if (led.ledId === ledId) {
            if (led.color !== color) {
                led.color = color;
            }
        }
    }
}

function clearAll() {
    for (led of leds) {
        if (led.color !== clearColor) {
            led.color = clearColor;
        }
    }
}

function setAll(color) {
    for (led of leds) {
        if (led.color !== color) {
            led.color = color;
        }
    }
}

var leds = [{
        ledId: "led-0-0",
        color: "color-16"
    },
    {
        ledId: "led-0-1",
        color: "color-16"
    },
    {
        ledId: "led-0-2",
        color: "color-16"
    },
    {
        ledId: "led-0-3",
        color: "color-16"
    },
    {
        ledId: "led-0-4",
        color: "color-16"
    },
    {
        ledId: "led-0-5",
        color: "color-16"
    },
    {
        ledId: "led-0-6",
        color: "color-16"
    },
    {
        ledId: "led-0-7",
        color: "color-16"
    },

    {
        ledId: "led-1-0",
        color: "color-16"
    },
    {
        ledId: "led-1-1",
        color: "color-16"
    },
    {
        ledId: "led-1-2",
        color: "color-16"
    },
    {
        ledId: "led-1-3",
        color: "color-16"
    },
    {
        ledId: "led-1-4",
        color: "color-16"
    },
    {
        ledId: "led-1-5",
        color: "color-16"
    },
    {
        ledId: "led-1-6",
        color: "color-16"
    },
    {
        ledId: "led-1-7",
        color: "color-16"
    },

    {
        ledId: "led-2-0",
        color: "color-16"
    },
    {
        ledId: "led-2-1",
        color: "color-16"
    },
    {
        ledId: "led-2-2",
        color: "color-16"
    },
    {
        ledId: "led-2-3",
        color: "color-16"
    },
    {
        ledId: "led-2-4",
        color: "color-16"
    },
    {
        ledId: "led-2-5",
        color: "color-16"
    },
    {
        ledId: "led-2-6",
        color: "color-16"
    },
    {
        ledId: "led-2-7",
        color: "color-16"
    },

    {
        ledId: "led-3-0",
        color: "color-16"
    },
    {
        ledId: "led-3-1",
        color: "color-16"
    },
    {
        ledId: "led-3-2",
        color: "color-16"
    },
    {
        ledId: "led-3-3",
        color: "color-16"
    },
    {
        ledId: "led-3-4",
        color: "color-16"
    },
    {
        ledId: "led-3-5",
        color: "color-16"
    },
    {
        ledId: "led-3-6",
        color: "color-16"
    },
    {
        ledId: "led-3-7",
        color: "color-16"
    },

    {
        ledId: "led-4-0",
        color: "color-16"
    },
    {
        ledId: "led-4-1",
        color: "color-16"
    },
    {
        ledId: "led-4-2",
        color: "color-16"
    },
    {
        ledId: "led-4-3",
        color: "color-16"
    },
    {
        ledId: "led-4-4",
        color: "color-16"
    },
    {
        ledId: "led-4-5",
        color: "color-16"
    },
    {
        ledId: "led-4-6",
        color: "color-16"
    },
    {
        ledId: "led-4-7",
        color: "color-16"
    },

    {
        ledId: "led-5-0",
        color: "color-16"
    },
    {
        ledId: "led-5-1",
        color: "color-16"
    },
    {
        ledId: "led-5-2",
        color: "color-16"
    },
    {
        ledId: "led-5-3",
        color: "color-16"
    },
    {
        ledId: "led-5-4",
        color: "color-16"
    },
    {
        ledId: "led-5-5",
        color: "color-16"
    },
    {
        ledId: "led-5-6",
        color: "color-16"
    },
    {
        ledId: "led-5-7",
        color: "color-16"
    },

    {
        ledId: "led-6-0",
        color: "color-16"
    },
    {
        ledId: "led-6-1",
        color: "color-16"
    },
    {
        ledId: "led-6-2",
        color: "color-16"
    },
    {
        ledId: "led-6-3",
        color: "color-16"
    },
    {
        ledId: "led-6-4",
        color: "color-16"
    },
    {
        ledId: "led-6-5",
        color: "color-16"
    },
    {
        ledId: "led-6-6",
        color: "color-16"
    },
    {
        ledId: "led-6-7",
        color: "color-16"
    },

    {
        ledId: "led-7-0",
        color: "color-16"
    },
    {
        ledId: "led-7-1",
        color: "color-16"
    },
    {
        ledId: "led-7-2",
        color: "color-16"
    },
    {
        ledId: "led-7-3",
        color: "color-16"
    },
    {
        ledId: "led-7-4",
        color: "color-16"
    },
    {
        ledId: "led-7-5",
        color: "color-16"
    },
    {
        ledId: "led-7-6",
        color: "color-16"
    },
    {
        ledId: "led-7-7",
        color: "color-16"
    },
];

module.exports = {
    leds,
    setLedById,
    clearAll,
    setAll
};
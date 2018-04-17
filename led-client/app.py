# Standard
import json
import re
# Third party
import requests
import paho.mqtt.client as mqtt
# https://github.com/jgarff/rpi_ws281x
from neopixel import *
# Local
from topics import Topic
from colors import colors

API_URL = 'http://kevinnovak.me/matrix/api'

MQTT_URL = 'kevinnovak.me'
MQTT_PORT = 1883

PAYLOAD_ENCODING = 'UTF-8'
PAYLOAD_LEDS = 'leds'
PAYLOAD_LED_ID = 'ledId'
PAYLOAD_COLOR = 'color'

# LED strip configuration:
LED_COUNT = 16      # Number of LED pixels.
LED_PIN = 18      # GPIO pin connected to the pixels (18 uses PWM!).
# LED_PIN        = 10      # GPIO pin connected to the pixels (10 uses SPI /dev/spidev0.0).
LED_FREQ_HZ = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA = 10      # DMA channel to use for generating signal (try 10)
LED_BRIGHTNESS = 255     # Set to 0 for darkest and 255 for brightest
# True to invert the signal (when using NPN transistor level shift)
LED_INVERT = False
LED_CHANNEL = 0       # set to '1' for GPIOs 13, 19, 41, 45 or 53

strip = Adafruit_NeoPixel(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
strip.begin()

def setLedById(ledId, color):
    try:
        led = parseLedId(ledId)
        rgb = colorToRGB(color)
        r = rgb[0]
        g = rgb[1]
        b = rgb[2]
        print(f'LED {led[0]} {led[1]} is R: {str(r)}, G: {str(g)}, B: {str(b)}')
        # GRB instead of RGB
        strip.setPixelColorRGB(1, g, r, b)
        strip.show()
    except Exception as error:
        print(error)


def parseLedId(ledId):
    match = re.match(r'^led-([0-7])-([0-7])$', ledId, flags=0)
    if match:
        x = match.group(1)
        y = match.group(2)
        return (x, y)
    else:
        raise Exception('Could not find a match.')


def colorToRGB(color):
    return colors[color]


def clearAll():
    print('Clear topic')


def setAll(color):
    rgb = colorToRGB(color)
    r = str(rgb[0])
    g = str(rgb[1])
    b = str(rgb[2])
    print(f'R: {r}\tG: {g}\t B: {b}')


def setState():
    try:
        request = requests.get(f'{API_URL}/state')
        state = request.json()
        for led in state[PAYLOAD_LEDS]:
            setLedById(led[PAYLOAD_LED_ID], led[PAYLOAD_COLOR])
    except Exception as error:
        print(error)


def start():
    client.on_connect = onConnect
    client.on_disconnect = onDisconnect
    client.on_message = onMessage

    client.connect(MQTT_URL, MQTT_PORT, 60)
    client.loop_forever()


def onConnect(client, userdata, flags, rc):
    print('Connected to MQTT Broker.')
    subscribe()
    setState()


def onDisconnect(client, userdata, rc):
    print('Disconnected from MQTT Broker.')


def onMessage(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode(PAYLOAD_ENCODING)

    print(f'  Topic: {topic}')
    print(f'  Payload: {payload}')

    if topic == Topic.LED.value:
        try:
            payload = json.loads(payload)
            setLedById(payload[PAYLOAD_LED_ID], payload[PAYLOAD_COLOR])
        except Exception as error:
            print(error)
    elif topic == Topic.CLEAR.value:
        clearAll()
    elif topic == Topic.SET.value:
        try:
            payload = json.loads(payload)
            setAll(payload[PAYLOAD_COLOR])
        except Exception as error:
            print(error)


def subscribe():
    for topic in Topic:
        client.subscribe(topic.value)


client = mqtt.Client()
start()

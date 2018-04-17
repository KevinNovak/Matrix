# Standard
import json
import re
# Third party
import requests
import paho.mqtt.client as mqtt
from neopixel import Adafruit_NeoPixel as Matrix, Color
# Local
from topics import Topic
from leds import leds
from colors import colors

API_URL = 'http://kevinnovak.me/matrix/api'

# MQTT configuration
MQTT_URL = 'kevinnovak.me'
MQTT_PORT = 1883

# MQTT payload configuration
PAYLOAD_ENCODING = 'UTF-8'
PAYLOAD_LEDS = 'leds'
PAYLOAD_LED_ID = 'ledId'
PAYLOAD_COLOR = 'color'

# LED matrix configuration
LED_COUNT = 64
LED_PIN = 18
LED_CHANNEL = 0  # Set to 1 for pins 13, 19, 41, 45 or 53
LED_BRIGHTNESS = 85  # 0 to 255

matrix = Matrix(LED_COUNT, LED_PIN, 800000, 10,
                False, LED_BRIGHTNESS, LED_CHANNEL)
client = mqtt.Client()


def setLedById(ledId, color):
    led = ledIdToLed(ledId)
    rgb = colorToRGB(color)
    r = rgb[0]
    g = rgb[1]
    b = rgb[2]
    print(f'LED {led} is R: {str(r)}, G: {str(g)}, B: {str(b)}')
    # GRB instead of RGB
    matrix.setPixelColor(led, Color(g, r, b))
    matrix.show()


def ledIdToLed(ledId):
    return leds[ledId]


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
    matrix.begin()

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


start()

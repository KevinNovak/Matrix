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
LED_BRIGHTNESS = 15  # 0 to 255

matrix = Matrix(LED_COUNT, LED_PIN, 800000, 10,
                False, LED_BRIGHTNESS, LED_CHANNEL)
client = mqtt.Client()


def setLedById(ledId, color):
    try:
        led = ledIdToLed(ledId)
        (r, g, b) = colorToRGB(color)
        print(f'LED {str(led)} is R: {str(r)}, G: {str(g)}, B: {str(b)}')
        matrix.setPixelColor(led, Color(r, g, b))
        matrix.show()
    except Exception as error:
        print(error)


# Raises exceptions
def ledIdToLed(ledId):
    match = re.match(r'^led-([0-7])-([0-7])$', ledId, flags=0)
    if match:
        x = int(match.group(1))
        y = int(match.group(2))
        return leds[x][y]
    else:
        raise Exception('Could not find a match.')


def colorToRGB(color):
    return colors[color]


def clearAll():
    print('Clear topic')
    setAll('color-18')


def setAll(color):
    (r, g, b) = colorToRGB(color)
    print(f'Setting all R: {str(r)}, G: {str(g)}, B: {str(b)}')
    for i in leds:
        for j in i:
            matrix.setPixelColor(j, Color(r, g, b))
    matrix.show()


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

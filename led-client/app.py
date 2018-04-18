# Standard
import json
import re
import configparser
# Third party
import requests
import paho.mqtt.client as mqtt
from neopixel import Adafruit_NeoPixel as Matrix, Color
# Local
from topics import Topic
from leds import leds
from colors import colors

config = configparser.ConfigParser(inline_comment_prefixes=('#'))
config.read('config.ini')

cfgMQTT = config['MQTT']
cfgAPI = config['API']
cfgPayload = config['Payload']
cfgMatrix = config['Matrix']
cfgOther = config['Other']

matrix = Matrix(cfgMatrix.getint('LED-Count'), cfgMatrix.getint('Pin'), 800000,
                10, False, cfgMatrix.getint('Brightness'), cfgMatrix.getint('Channel'))
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
    print('Clearing all LEDs.')
    setAll(cfgOther['Clear-Color'])


def setAll(color):
    (r, g, b) = colorToRGB(color)
    print(f'Setting all R: {str(r)}, G: {str(g)}, B: {str(b)}')
    for row in leds:
        for led in row:
            matrix.setPixelColor(led, Color(r, g, b))
    matrix.show()


def setState():
    try:
        request = requests.get(f'{cfgAPI["URL"]}/state')
        state = request.json()
        for led in state[cfgPayload['LEDs']]:
            setLedById(led[cfgPayload['LED-ID']],
                       led[cfgPayload['Color']])
    except Exception as error:
        print(error)


def start():
    matrix.begin()

    client.on_connect = onConnect
    client.on_disconnect = onDisconnect
    client.on_message = onMessage

    client.connect(cfgMQTT['URL'], cfgMQTT.getint('Port'), 60)
    client.loop_forever()


def onConnect(client, userdata, flags, rc):
    print('Connected to MQTT Broker.')
    subscribe()
    setState()


def onDisconnect(client, userdata, rc):
    print('Disconnected from MQTT Broker.')


def onMessage(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode(cfgAPI['Encoding'])

    print(f'  Topic: {topic}')
    print(f'  Payload: {payload}')

    if topic == Topic.LED.value:
        try:
            payload = json.loads(payload)
            setLedById(payload[cfgPayload['LED-ID']],
                       payload[cfgPayload['Color']])
        except Exception as error:
            print(error)
    elif topic == Topic.CLEAR.value:
        clearAll()
    elif topic == Topic.SET.value:
        try:
            payload = json.loads(payload)
            setAll(payload[cfgPayload['Color']])
        except Exception as error:
            print(error)


def subscribe():
    for topic in Topic:
        client.subscribe(topic.value)


start()

# Standard
import json
import re
# Third party
import requests
import paho.mqtt.client as mqtt
# Local
from topics import Topic
from colors import colors

API_URL = 'http://kevinnovak.me/matrix/api'

MQTT_URL = 'kevinnovak.me'
MQTT_PORT = 1883

PAYLOAD_ENCODING = 'UTF-8'
PAYLOAD_LED_ID = 'ledId'
PAYLOAD_COLOR = 'color'


def setLedById(ledId, color):
    rgb = colorToRGB(color)
    print('LED: ' + ledId)
    r = str(rgb[0])
    g = str(rgb[1])
    b = str(rgb[2])
    print(f'R: {r}\tG: {g}\t B: {b}')


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
        leds = request.json()
        for led in leds:
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


def parseLedId(ledId):
    match = re.match(r'^led-([0-7])-([0-7])$', ledId, flags=0)
    if match:
        x = match.groups(1)
        y = match.groups(2)
        print(f'Found {x} and {y}')
    else:
        print('No match found')
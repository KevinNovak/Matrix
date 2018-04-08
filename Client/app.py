# Standard
import json
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
    print('R: ' + str(rgb[0]) + '\tG: ' + str(rgb[1]) + '\tB: ' + str(rgb[2]))


def colorToRGB(color):
    return colors[color]


def clearAll():
    print('Clear topic')


def setAll(color):
    rgb = colorToRGB(color)
    print('R: ' + str(rgb[0]) + '\tG: ' + str(rgb[1]) + '\tB: ' + str(rgb[2]))


def setState():
    request = requests.get(API_URL + '/state')
    print(request.json())


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

    print('  Topic: ' + topic)
    print('  Payload: ' + payload)

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

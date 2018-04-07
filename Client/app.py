import json
import paho.mqtt.client as mqtt

TOPIC_LED = 'matrix/led'
TOPIC_CLEAR = 'matrix/clear'
TOPIC_SET = 'matrix/set'


def setLedById(ledId, color):
    print('LED topic: ' + ledId + ' ' + color)


def clearAll():
    print('Clear topic')


def setAll(color):
    print('Set topic ' + color)


def start():
    client.on_connect = on_connect
    client.on_message = on_message

    client.connect('kevinnovak.me', 1883, 60)
    client.loop_forever()


def on_connect(client, userdata, flags, rc):
    print('Connected to MQTT Broker.')
    subscribe()


def on_disconnect(client, userdata, rc):
    print('Disconnected from MQTT Broker.')


def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode('utf-8')

    print('  Topic: ' + topic)
    print('  Payload: ' + str(payload))

    if topic == TOPIC_LED:
        try:
            payload = json.loads(payload)
            setLedById(payload['ledId'], payload['color'])
        except Exception as error:
            print(error)
    elif topic == TOPIC_CLEAR:
        clearAll()
    elif topic == TOPIC_SET:
        try:
            payload = json.loads(payload)
            setAll(payload['color'])
        except Exception as error:
            print(error)


def subscribe():
    client.subscribe(TOPIC_LED)
    client.subscribe(TOPIC_CLEAR)
    client.subscribe(TOPIC_SET)


client = mqtt.Client()
start()

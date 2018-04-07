import paho.mqtt.client as mqtt


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
    print('  Topic: ' + msg.topic)
    print('  Payload: ' + str(msg.payload))


def subscribe():
    client.subscribe('matrix/led')
    client.subscribe('matrix/clear')
    client.subscribe('matrix/set')


client = mqtt.Client()
start()

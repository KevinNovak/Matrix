import paho.mqtt.client as mqtt


# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
    print('Connected to MQTT Broker.')
    subscribe()


def on_disconnect(client, userdata, rc):
    print('Disconnected from MQTT Broker.')


# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    print('  Topic: ' + msg.topic)
    print('  Payload: ' + str(msg.payload))


def subscribe():
    client.subscribe('matrix/led')
    client.subscribe('matrix/clear')
    client.subscribe('matrix/set')


client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect('kevinnovak.me', 1883, 60)

# Blocking call that processes network traffic, dispatches callbacks and
# handles reconnecting.
# Other loop*() functions are available that give a threaded interface and a
# manual interface.
client.loop_forever()

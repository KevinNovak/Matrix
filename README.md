# Matrix
### Color an LED matrix in real-time.

Leverages the MQTT protocol using Mosca, MQTT.js, and Paho Python.

Broken into 3 main applications:

1. **MQTT/UI Server**
    * Single Node.js application with two main functions:
        1. Run a Mosca MQTT broker.
        2. Serve web pages using Express.
            * Each UI client subscribes the the Mosca broker.
2. **LED Client**
    * Raspberry Pi client which subscribes to the Mosca broker.
    * Controls an 8x8 RGB LED matrix.
3. **Stream Server**
    * Streams live video of the LED matrix to the UI clients.
    * Runs on the same Raspberry Pi as the LED client.

## References
* [Mosca](https://www.npmjs.com/package/mosca) by [Matteo Collina](https://github.com/mcollina) - Node.js MQTT broker
* [MQTT.js](https://www.npmjs.com/package/mqtt) by [Matteo Collina](https://github.com/mcollina) - Use MQTT in the browser
* [MQTT over WebSockets](https://github.com/mcollina/mosca/wiki/MQTT-over-Websockets) by [Matteo Collina](https://github.com/mcollina) - Use MQTT over WebSockets
* [Paho Python](https://www.eclipse.org/paho/clients/python/) by [Eclipse](https://www.eclipse.org/) - Use MQTT in python
* [raspivid-stream](https://www.npmjs.com/package/raspivid-stream) by [Tim Perry](https://github.com/pimterry) - Capture video from Raspberry Pi
* [pi-cam](https://github.com/pimterry/pi-cam) by [Tim Perry](https://github.com/pimterry) - Working example of raspivid-stream
* [h264-live-player](https://github.com/131/h264-live-player) by [François Leurent](https://github.com/131) - Play h264 video in the browser
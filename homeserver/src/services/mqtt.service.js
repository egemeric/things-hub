const mqtt = require('mqtt')

const mqtt_host = '10.1.1.144'
const mqtt_port = '1883'
const mqtt_clientId = `mqtt_${Math.random().toString(16).slice(3)}`

var DEVICES = new Set()
const connectUrl = `mqtt://${mqtt_host}:${mqtt_port}`

const mqtt_client = mqtt.connect(connectUrl, {
    mqtt_clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
})
function setMqtt() {
    
mqtt_client.on('connect', function () {
    mqtt_client.subscribe('/home/egemeric/register/device', function (err) {
      if (err) {
        console.log(err);
      }
    })
  })

  mqtt_client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString())
    const msg = message.toString()
    if (msg.startsWith("ESP8266Client-")){
        DEVICES.add(msg);
        console.log(DEVICES);
    }
    
  })
}
  module.exports = {
      mqtt_client,
      DEVICES,
      setMqtt
}
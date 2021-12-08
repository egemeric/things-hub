const mqtt = require("mqtt");
const mqttControllerRouter = require("../controllers/mqttTopic.controller");
const mqtt_host = "127.0.0.1";
const mqtt_port = "1883";
const mqtt_clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const db = require("../models");
var DEVICES = new Set();
const connectUrl = `mqtt://${mqtt_host}:${mqtt_port}`;
let mqtt_client_topics = [];
const mqtt_client = mqtt.connect(connectUrl, {
  mqtt_clientId,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});
function setMqtt() {
  mqtt_client.on("connect", async function () {
    await db["Home"]
      .findAll()
      .then(async (home) => {
        let rooms = await home[0].getRooms();
        let tmpTopic;
        for (let room in rooms) {
          tmpTopic = `/${home[0].aliasName}/${rooms[room].roomName}/register/device`;
          mqtt_client.subscribe([tmpTopic], subscribeErr);
        }
      })
      .catch((error) => console.log(error));
  });

  const subscribeErr = function (err, granted) {
    if (err) {
      console.log(err);
    } else {
      mqtt_client_topics.push(granted[0].topic);
    }
  };
  mqtt_client.on("message", async function (topic, message) {
    // message is Buffer
    const msg = message.toString();
    if (msg.startsWith("ESP8266Client-")) {
      DEVICES.add(msg);
      console.log(DEVICES);
    }
    mqttControllerRouter(message, topic, mqtt_client);
  });
}
module.exports = {
  mqtt_client,
  mqtt_client_topics,
  DEVICES,
  setMqtt,
};

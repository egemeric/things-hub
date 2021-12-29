const db = require("../models");
let subscribeds;
const mqttController = {
  registerDevice: async (home, room, msg) => {
    try {
      msg = JSON.parse(msg);
    } catch (e) {
      console.log(e);
    }
    console.log(
      `New Device Registration:\n[obj:${msg}, toRoom:${room}, home:${home}]`
    );
    db["Home"]
      .findOne({ where: { aliasName: home } })
      .then((ahome) => {
        db["Room"]
          .findOne({ where: { roomName: room } })
          .then((aroom) => {
            db["Device"]
              .create({
                deviceName: msg?.deviceName,
                RoomId: aroom.id,
                HomeId: ahome.id,
                deviceEndpoints: JSON.stringify(msg.deviceEndpoints),
                publishPoints: JSON.stringify(msg?.publishPoints),
              })
              .catch((error) => console.log(error));
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));
  },

  setdeviceEndPoints: (mqtt_client) => {
    db["Home"]
      .findAll()
      .then(async (home) => {
        let rooms = await home[0].getRooms();
        for (let room in rooms) {
          try {
            let roomDevice = await rooms[room].getDevices({
              attributes: ["publishPoints", "deviceEndpoints"],
            });
            let roomDeviceDataUrl = JSON.parse(
              roomDevice.map((arr) => arr.dataValues.publishPoints)[0]
            );
            roomDevice = JSON.parse(
              roomDevice.map((arr) => arr.dataValues.deviceEndpoints)[0]
            )[0];

            roomDevice = Object.keys(roomDevice).map(
              (arr) => `/${home[0].aliasName}/${rooms[room].roomName}/+` + arr
            );
            console.log(roomDevice);
            roomDeviceDataUrl = roomDeviceDataUrl.map(
              (arr) => `/${home[0].aliasName}/${rooms[room].roomName}/+` + arr
            );
            await mqtt_client.subscribe([...roomDeviceDataUrl]);
            await mqtt_client.subscribe([...roomDevice]);
          } catch (e) {
            console.log(e);
          }
        }
      })
      .catch((error) => console.log(error));
  },

  dataLogger: async (deviceName, dataType, value) => {
    await db["Device"]
      .findOne({ where: { deviceName } })
      .then((device) => {
        let deviceId = device.id;
        console.log("Data logger:", deviceId);
        db["DeviceData"]
          .create({
            date: new Date(),
            dataType: dataType,
            data: value,
            DeviceId: deviceId,
          })
          .catch((e) => console.log(e));
      })
      .catch((e) => console.log(e));
  },

  relayEventLogger: async (deviceName, eventEndpoint, value) => {
    await db["Device"].findOne({ where: { deviceName } }).then((device) => {
      let DeviceId = device.id;
      db["DeviceEvent"].create({
        date: new Date(),
        endPoint: eventEndpoint,
        eventData: value,
        DeviceId
      });
    });
  },
};

const topicRouter = (msg, topic, mqtt_client) => {
  let parsedTopic = topic.split("/");
  console.log(parsedTopic);
  let homeAlias = parsedTopic[1];
  let roomName = parsedTopic[2];
  console.log(msg, topic);
  if (topic.endsWith("/register/device")) {
    mqttController.registerDevice(homeAlias, roomName, msg.toString());
    mqttController.setdeviceEndPoints(mqtt_client);
  } else if (parsedTopic.includes("data")) {
    let deviceName = parsedTopic[3];
    let dataType = parsedTopic.pop();
    mqttController.dataLogger(deviceName, dataType, msg.toString());
    console.log("Data Topic");
  } else if (parsedTopic.includes("relay")) {
    let deviceName = parsedTopic[3];
    let Pin = parsedTopic.pop();
    Pin = "/relay/" + Pin;
    mqttController.relayEventLogger(deviceName,Pin,msg.toString())
  } else {
    console.error("topic connot be routed:", topic);
  }
};

module.exports = { topicRouter, mqttController };

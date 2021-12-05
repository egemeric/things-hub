const { resolve } = require("path/posix");
const db = require("../models");
let subscribeds;
const mqttController = {
  registerDevice: async (home, room, msg) => {
    console.log(
      `New Device Registration:\n[name:${msg}, toRoom:${room}, home:${home}]`
    );
    db["Home"]
      .findOne({ where: { aliasName: home } })
      .then((ahome) => {
        db["Room"]
          .findOne({ where: { roomName: room } })
          .then((aroom) => {
            db["Device"]
              .create({
                deviceName: msg,
                RoomId: aroom.id,
                HomeId: ahome.id,
              })
              .catch((error) => console.log(error));
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));
  },
};

const topicRouter = (msg, topic) => {
  let parsedTopic = topic.split("/");
  console.log(parsedTopic);
  let homeAlias = parsedTopic[1];
  let roomName = parsedTopic[2];
  console.log(msg, topic);
  if (topic.endsWith("/register/device")) {
    mqttController.registerDevice(homeAlias, roomName, msg.toString());
  } else {
    console.warn("topic cannot be routed!");
  }
};

module.exports = topicRouter;

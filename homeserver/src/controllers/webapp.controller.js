const { cameraDatas } = require("./mqttTopic.controller");
const stream = require("stream");
const mqtt = require("../services/mqtt.service");
const db = require("../models");
const index = async (req, res) => {
  let page;
  let home = await db["Home"]
    .findOne({ where: { id: 1 } })
    .catch((error) => console.log(error));
  let rooms = await home.getRooms();
  let HomeData = [];
  for (let i in rooms) {
    let devices = await rooms[i].getDevices();
    HomeData.push({
      room: {
        ...rooms[i]?.dataValues,
        devices: devices.map((device) => device.dataValues),
      },
    });
    console.log(devices);
  }
  console.log(HomeData);
  page = {
    name: "Home Name:" + home.aliasName,
    homeName: home.aliasName,
    Home: HomeData,
  };
  res.render("home", { page });
};
const getRooms = async (req, res) => {
  let home = await db["Home"].findAll();
  let rooms = await home[0].getRooms();
  res.json(rooms);
};

const getDevices = async (req, res) => {
  let { RoomId } = req.params;
  await db["Device"]
    .findAll({ where: { RoomId } })
    .then((devices) => res.json(devices))
    .catch((error) => res.json(error));
};

const getHomeDevices = async (req, res) => {
  let home = await db["Home"].findAll();
  let devices = await home[0].getDevices();
  res.json(devices);
};
const chat = (req, res) => {
  let page;
  page = {
    name: "websocket",
  };
  res.render("websocket", { page });
};

const jpegStream = async (req, res) => {
  let roomCamera = req.query.roomName
  console.log(roomCamera)

  let data = cameraDatas[roomCamera];
  if(data === undefined){
    return res.status(404).send("not found");
  }
  console.log(cameraDatas);
  var multipart = "--totalmjpeg";
  res.writeHead(200, {
    "Cache-Control":
      "no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0",
    Pragma: "no-cache",
    Connection: "close",
    "Content-Type": 'multipart/x-mixed-replace; boundary="' + multipart + '"',
  });
  res.write("--" + multipart + "\r\n", "ascii");
  res.write("Content-Type: image/jpeg\r\n");
  res.write("Content-Length: " + Buffer.from(data, "binary").length + "\r\n");
  res.write("\r\n", "ascii");
  res.write(Buffer.from(data, "binary"));
  res.write("\r\n", "ascii");
  res.end();
};

module.exports = {
  index,
  chat,
  getRooms,
  getDevices,
  getHomeDevices,
  jpegStream,
};

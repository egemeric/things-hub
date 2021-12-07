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

module.exports = {
  index,
  chat,
  getRooms,
  getDevices,
  getHomeDevices,
};

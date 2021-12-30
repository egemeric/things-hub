const ROOT = "/home/egemeric/";
const { mqtt_client } = require("../services/mqtt.service");
const db = require("../models/index");

const getDevices = async (req, res) => {
  const devices = Array.from(mqtt.DEVICES);
  res.send(devices);
};
const getDeviceData = async (req, res) => {
  const deviceName = req.body?.deviceName || req.query?.deviceName;
  console.log(deviceName);
  let device = await db["Device"]
    .findOne({ where: { deviceName } })
    .then((result) => {
      return result;
    })
    .catch((e) => {
      res.status(500).json(e);
    });

  var dataTypes = JSON.parse(device.publishPoints);
  let filteredData = await db["DeviceData"]
    .findAll({ where: { ...device?.id } })
    .then((result) => {
      let response = {};
      dataTypes.forEach((element) => {
        element = element.split("/").pop();
        let sameDatas = result.filter(obj => obj.dataType === element);
        response[element] = sameDatas;
      });
      return response;
    })
    .catch((e) => {
      res.status(500).json(e);
    });
res.status(200).json(filteredData);
};

const publishMessage = async (req, res) => {
  console.log(req.body);
  mqtt_client.publish(String(req?.body?.topic), String(req?.body?.msg));
  res.status(200).send();
};

module.exports = {
  getDevices,
  publishMessage,
  getDeviceData,
};

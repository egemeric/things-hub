const ROOT = "/home/egemeric/";
const { mqtt_client } = require("../services/mqtt.service");
const db = require("../models/index");
const { Json } = require("sequelize/dist/lib/utils");

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
        let sameDatas = result.filter((obj) => obj.dataType === element);
        for (const dp in sameDatas) {
          try {
            sameDatas[dp].data = JSON.parse(sameDatas[dp]?.data);
          } catch (error) {}
        }
        response[element] = sameDatas;
        console.log(sameDatas);
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

const getDevicePublishPoints = async (req, res) => {
  const deviceName = req.body?.deviceName || req.query?.deviceName;
  console.log(deviceName);
  let device = await db["Device"]
    .findOne({ where: { deviceName } })
    .then((result) => {
      res.status(200).json({
        result: JSON.parse(result?.publishPoints).map((p) => {
          p = (p.split("/"));
          return p.pop();
        }),
      });
      return result;
    })
    .catch((e) => {
      res.status(500).json(e);
    });
};

module.exports = {
  getDevices,
  publishMessage,
  getDeviceData,
  getDevicePublishPoints,
};

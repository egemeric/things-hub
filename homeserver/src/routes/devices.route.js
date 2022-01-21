const express = require('express');
const devController = require("../controllers/device.controller")
const router = express.Router({ mergeParams: true });
router.route("/devices").get(devController.getDevices);
router.route("/publish").post(devController.publishMessage);
router.route("/data").get(devController.getDeviceData);
router.route("/dataEndpoints").get(devController.getDevicePublishPoints);

module.exports = router
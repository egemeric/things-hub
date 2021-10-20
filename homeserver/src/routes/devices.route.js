const express = require('express');
const devController = require("../controllers/device.controller")
const router = express.Router({ mergeParams: true });
router.route("/devices").get(devController.getDevices)

module.exports = router
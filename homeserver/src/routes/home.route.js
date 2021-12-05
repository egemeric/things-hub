const express = require('express');
const {getRooms,getDevices,getHomeDevices} = require("../controllers/webapp.controller")
const router = express.Router({ mergeParams: true });
router.route("/home/rooms").get(getRooms);
router.route("/home/:RoomId/devices").get(getDevices);
router.route("/home/devices").get(getHomeDevices);

module.exports = router
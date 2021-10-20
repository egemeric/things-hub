const express = require('express');
const controlRoute = require("./control.route");
const devRoute = require("./devices.route")
const webAppRoute = require("./webapp.route")
const router = express.Router();
router.use('/api',controlRoute)
router.use('/api',devRoute)
router.use("/", webAppRoute)
module.exports = router;
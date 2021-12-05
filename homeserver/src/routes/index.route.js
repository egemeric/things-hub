const express = require('express');
const controlRoute = require("./control.route");
const devRoute = require("./devices.route")
const webAppRoute = require("./webapp.route")
const homeRoute = require('./home.route');
const { route } = require('./control.route');
const router = express.Router();
router.use('/api',controlRoute);
router.use('/api',devRoute);
router.use('/api',homeRoute);
router.use("/", webAppRoute);
module.exports = router;
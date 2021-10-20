const express = require('express');
const router = express.Router({ mergeParams: true });
const webController = require("../controllers/webapp.controller")

router.route("/home").get(webController.index)

module.exports = router

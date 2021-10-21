const express = require('express');
const router = express.Router({ mergeParams: true });
const webController = require("../controllers/webapp.controller")

router.route("/home").get(webController.index)
router.route("/chat").get(webController.chat)

module.exports = router

const express = require('express');
const relayController = require("../controllers/relay.controller");
const router = express.Router({ mergeParams: true });
router.route("/control/open").get(relayController.openRelay)
router.route("/control/close").get(relayController.closeRelay)

module.exports = router;
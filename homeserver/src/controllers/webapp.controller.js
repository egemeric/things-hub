const mqtt = require("../services/mqtt.service")
const index = (req, res) => {
    let page;
    page = {
        name: "Dashboard",
        devices: Array.from(mqtt.DEVICES)
    }
    res.render('home', { page });
}

module.exports = {
    index
}
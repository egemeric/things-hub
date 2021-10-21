const mqtt = require("../services/mqtt.service")
const index = (req, res) => {
    let page;
    page = {
        name: "Dashboard",
        devices: Array.from(mqtt.DEVICES)
    }
    res.render('home', { page });
}

const chat = (req,res) => {
    let page;
    page = {
        name: "websocket"
    }
    res.render('websocket',{page})
}

module.exports = {
    index,
    chat
}
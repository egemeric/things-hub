const ROOT = "/home/egemeric/"
const mqtt = require("../services/mqtt.service")

const getDevices = async (req,res)=>{
    const devices = Array.from(mqtt.DEVICES)
    res.send(devices)
}

module.exports = {
    getDevices
}
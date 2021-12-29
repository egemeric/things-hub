const ROOT = "/home/egemeric/"
const {mqtt_client} = require("../services/mqtt.service")

const getDevices = async (req,res)=>{
    const devices = Array.from(mqtt.DEVICES)
    res.send(devices)
}

const publishMessage = async (req,res) => {
    console.log(req.body);
    mqtt_client.publish(String(req?.body?.topic),String(req?.body?.msg));
    res.status(200).send();
}

module.exports = {
    getDevices,
    publishMessage
}
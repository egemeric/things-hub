const mqtt_client = require("../services/mqtt.service")
const ROOT = "/home/egemeric/"
const openRelay = async (req, res) => {

        const topic = ROOT + req.query.devid +"/light"
        mqtt_client.mqtt_client.publish(topic, '1', { qos: 0, retain: false }, (error) => {
            if (error) {
                console.error(error)
            }
        })

    console.log(mqtt_client.DEVICES)
    return res.status(200).send()
}
const closeRelay = async (req, res) => {
    const topic = ROOT + req.query.devid +"/light"
    mqtt_client.mqtt_client.publish(topic, '0', { qos: 0, retain: false }, (error) => {
        if (error) {
            console.error(error)
        }
    })


    return res.status(200).send()
}

module.exports = {
    openRelay,
    closeRelay
}
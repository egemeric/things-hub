const mqtt = require("../services/mqtt.service");
const db = require('../models');
const index = (req, res) => {
    let page;
    page = {
        name: "Dashboard",
        devices: Array.from(mqtt.DEVICES)
    }
    res.render('home', { page });
}
const getRooms = async (req,res)=>{
    let home = await db['Home'].findAll();
    let rooms = await home[0].getRooms();
    res.json(rooms);
}

const getDevices = async(req,res)=>{
    let {RoomId} = req.params;
    await db['Device'].findAll({where:{RoomId}})
    .then((devices)=>res.json(devices))
    .catch(error=>res.json(error));
}

const getHomeDevices = async(req,res)=>{
    let home = await db['Home'].findAll();
    let devices = await home[0].getDevices();
    res.json(devices);
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
    chat,
    getRooms,
    getDevices,
    getHomeDevices
}
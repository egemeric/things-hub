const websocket = require('ws')

const wss1 = new websocket.WebSocketServer({ noServer: true });
const ROOMS = {};

wss1.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};
wss1.on('connection', function connection(ws) {
    let parsed
    ws.id = wss1.getUniqueID();
    broadcast("Client Connected websocket ID:" + ws.id);
    ws.on('message', function incoming(message) {
        try {
            parsed = JSON.parse(message);
        } catch (e) {
            console.log(e);
            ws.send(JSON.stringify({ ok: false }));
            return
        }
        if (parsed.room) {
            if (ROOMS[parsed.room]) {

                console.log(ROOMS[parsed.room].users.length)
                if (!ROOMS[parsed.room].users.includes(ws)) {
                    ROOMS[parsed.room].users.push(ws)
                    ws.send(JSON.stringify({ ok: true, rooms: Object.keys(ROOMS) }));
                }else{
                    ws.send(JSON.stringify({ ok: false, msg:"You have already joined to this room." }));
                }
            } else {
                ROOMS[parsed.room] = { users: [ws] }
                ws.send(JSON.stringify({ ok: true, rooms: Object.keys(ROOMS) }));
            }
        }
        console.log("parsed json:", parsed);

    });

    ws.on('close', function close() {
        console.log("Client disconnected websocket ID:", ws.id)

    });


});

function broadcast(message) {
    wss1.clients.forEach(client => {
        client.send(message);
    })
}



module.exports = {
    wss1
}

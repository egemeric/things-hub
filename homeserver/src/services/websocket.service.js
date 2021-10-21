const websocket = require('ws')

const wss1 = new websocket.WebSocketServer({ noServer: true });
let USERS = [];

wss1.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};
wss1.on('connection', function connection(ws) {
    let parsed
    ws.id = wss1.getUniqueID();
    broadcast({"newCon":ws.id}); 
    USERS.push(ws.id)
    ws.send(JSON.stringify({"userlist":USERS}))
    ws.on('message', function incoming(message) {
        try {
            parsed = JSON.parse(message);
        } catch (e) {
            console.log(e);
            ws.send(JSON.stringify({ ok: false }));
            return
        }
        
        console.log("parsed json:", parsed);

    });

    ws.on('close', function close() {
        console.log("Client disconnected websocket ID:", ws.id)
        USERS = arrayRemove(USERS,ws.id)
        ws.send(JSON.stringify({"userlist":USERS}))
    });


});

function arrayRemove(arr, value) {
 
    return arr.filter(function(val){
        return val != value;
    });
  
 }

function broadcast(message) {
    wss1.clients.forEach(client => {
        client.send(JSON.stringify(message));
    })
}



module.exports = {
    wss1
}

const websocket = require('ws')

const wss1 = new websocket.WebSocketServer({ noServer: true });
let USERS = {};

wss1.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};
wss1.on('connection', function connection(ws) {
    let parsed
    ws.id = wss1.getUniqueID();  
    USERS[ws.id]= {aliasName:""}
    ws.send(JSON.stringify({'yourId':ws.id}))
    broadcast({USERS}); 
    ws.on('message', function incoming(message) {
        try {
            parsed = JSON.parse(message);
        } catch (e) {
            console.log(e);
            ws.send(JSON.stringify({ ok: false }));
            return
        }
       if(parsed.message && parsed.to){
           sendMsg(ws.id,parsed.to,parsed.message)
       }
       if(parsed.aliasName){
           USERS[ws.id].aliasName=parsed.aliasName
           broadcast({USERS}); 
       }
        
        console.log("parsed json:", parsed);

    });

    ws.on('close', function close() {
        console.log("Client disconnected websocket ID:", ws.id)
        delete USERS[ws.id]
        broadcast({"userlist":USERS})
    });


});

function sendMsg(from,to,msg){
    wss1.clients.forEach(client => {
        
        if(to == client.id){
            client.send(JSON.stringify(msg));
            console.log("message has been send:",{from,msg})
        }
    })
}


function broadcast(message) {
    wss1.clients.forEach(client => {
        client.send(JSON.stringify(message));
    })
}



module.exports = {
    wss1
}

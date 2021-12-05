
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const mqtt = require('./services/mqtt.service')
const routes = require("./routes/index.route")
const websocket = require('./services/websocket.service')
const setDb =  require('./config/initialDatabase');
const url = require("url")
var path = require('path');
const app = express()
const PORT = 9000
const HOST = '0.0.0.0';
setDb();

mqtt.setMqtt();

app.use('/static',express.static(path.join(__dirname, '/views/static')));
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(routes)
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send('Hello Worlds!')
})


const httpServer = http.createServer(app,websocket.wss1);

httpServer.on('upgrade', function upgrade(request, socket, head) {
    const { pathname } = url.parse(request.url);
  
    if (pathname === '/websocket') {
      websocket.wss1.handleUpgrade(request, socket, head, function done(ws) {
        websocket.wss1.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

httpServer.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`);
module.exports = { app };

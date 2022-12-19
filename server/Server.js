const TAG = 'Server';
const config = require('../config.json');
const utils = require('../utils/Utils');
const messageHandler = require('../server/MessageHandler');
const fs = require("fs");
const express = require('express');
const app = express();
const http = require("http");
const https = require("https");
const httpServer = http.createServer(app);
const io = require("socket.io");
const ioHttp = new io.Server(httpServer);

const privateKey = fs.readFileSync('key.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate
};
const httpsServer = https.createServer(credentials, app);
const ioHttps = new io.Server(httpsServer);

module.exports = class Server {
    start(){
        // app.use((req, res, next) => {
        //     if (req.secure) {
        //         utils.log(TAG, "Https: next");
        //         next();
        //     }
        //     else {
        //         utils.log(TAG, "Http: redirect");
        //         res.redirect("https://" + req.hostname + ":" + config.server.https_node_port);
        //     }
        // });
        app.use(express.static(config.server.web_dir));

        httpServer.listen(config.server.http_node_port, () => {
            utils.log(TAG, "listening on *:" + config.server.http_node_port);
            new messageHandler(ioHttp);
        });
        // httpsServer.listen(config.server.https_node_port, () => {
        //     utils.log(TAG, "listening on *:" + config.server.https_node_port);
        //     new messageHandler(ioHttps);
        // })
    }
}

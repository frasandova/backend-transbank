require('dotenv').config();


const Server = require('./models/server');

const server = new Server();

server.app.get('*', (req,res) => {
    res.sendFile( __dirname + '/public/index.html');
});

server.listen();



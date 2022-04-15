require('dotenv').config();
const hbs = require('express-hbs');
var cookieParser = require("cookie-parser");

const Server = require('./models/server');

const server = new Server();


server.app.use(cookieParser());

  //Plantillas HTML
   server.app.engine('hbs', hbs.express4({
    layoutDir: __dirname + '/views/layouts'
  }));
  server.app.set('view engine', 'hbs');
  server.app.set('views', __dirname + '/views/layouts');

server.app.get('*', (req,res) => {
    res.sendFile( __dirname + '/public/index.html');
});

// catch 404 and forward to error handler
server.app.use(function (req, res, next) {
    next(createError(404));
  });

server.listen();



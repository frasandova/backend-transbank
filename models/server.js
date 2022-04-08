const express = require('express');
var cors = require('cors')

const transbankRoutes = require('../routes/transbank-routes')

class Server {

    constructor(){
        this.app = express();
        this.PORT = process.env.PORT;

        //Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();
    }


    middlewares(){

        //Cors 
        var whitelist = ['http://localhost:3000', 'http://example2.com']
        var corsOptions = {
        origin: function (origin, callback) {
            if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
            } else {
            callback(new Error('Not allowed by CORS'))
            }
        }
        }
        if(process.env.ENVIROMENT === 'prod'){
            this.app.use(cors(corsOptions));
        }else{
            this.app.use(cors());
        }

        // Lectura y parseo del Body
        this.app.use(express.json());
        
        //Directorio Publico
        this.app.use(express.static('public'))
    }

    routes() {


        this.app.use('/', transbankRoutes);

        // this.app.get('*', (req,res) => {
        //     res.sendFile( __dirname + '/public/index.html');
        //     // res.sendFile('../public/index.html');
        // });


    }

    listen() {
        this.app.listen(this.PORT, () => {
            console.log('Servidor ejecutandose en puerto', this.PORT)
        });
    }

}

module.exports = Server;
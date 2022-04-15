const express = require('express');
const cors = require('cors')

const transbankRoutes = require('../routes/transbank-routes');

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

     
        // this.app.engine('hbs', hbs.express4({
        //     layoutDir:'./views/layouts'
        // }))
        // this.app.set('views', './views/layouts');
        // this.app('view engine', 'hbs');

        //Cors 
        var whitelist = ['https://www.musikastudio.online']
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
        this.app.use(express.urlencoded({ extended: false }));
        
        //Directorio Publico
        this.app.use(express.static('public'))
    }

    routes() {


        this.app.use('/', transbankRoutes);


    }

    listen() {
        this.app.listen(this.PORT, () => {
            console.log('Servidor ejecutandose en puerto', this.PORT)
        });
    }

}

module.exports = Server;
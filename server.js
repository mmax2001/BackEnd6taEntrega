const express = require('express');
const {Server:HttpServer} = require('http');
const {Server:IOServer} = require('socket.io');
const handlebars=require('express-handlebars')
const {Router}=express
const ContenedorAPI = require('./ContenedorAPI.js')
const MsjsAPI = require('./MensajesAPI.js')

const app = express();
const router=Router();
const ContenedorProductos= new ContenedorAPI();
const ChatMsjs= new MsjsAPI('mensajes');

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use('/productos', router);
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

router.use(express.json());
router.use(express.urlencoded({ extended: true }))

const productos=[{"title":"Escuadra","price":123.45,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png","id":1},{"title":"Calculadora","price":234.56,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/calculator-math-tool-school-256.png","id":2},{"title":"Globo Terráqueo","price":345.67,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/globe-earth-geograhy-planet-school-256.png","id":3}]
//const productos=[];
ContenedorProductos.prodListAPI=productos;

//Indico que quiero cargar los archivos estaticos que se 
//encuentran en dicha carpeta
app.use(express.static('./public'))

//Configuracion para Handlebars
app.engine('hbs', 
handlebars.engine({
    extname:'.hbs',
    defaultLayout:'index.hbs', 
    layoutsDir:__dirname + "/views/layouts", //defino la ruta a la plantilla principal
    partialsDir:__dirname + "/views/partials" //ruta a los parciales
    })
);
app.set('view engine', 'hbs');
app.set('views', './views');

//Esta ruta carga el archivo index.hbs en la raiz de la misma

router.get('/', async (req, res) => {
    try {
        const productos = ContenedorProductos.getAll()
        //res.send(productos)
        res.render('main',{productos})
        //res.render('layout');

    } catch (error) {
        res.send(error)
    }
})

//configuro la conexion para enviar mensajes desde el servidor al cliente 
//con el nombre del evento 'connection' y una funcion de callback
io.on('connection',(socket)=>{
    console.log('Cliente conectado')
    // socket.emit('mi mensaje','Este es mi mensaje desde el servidor')
    
    //Cargo la lista de productos inicialmente
    socket.emit('listadoProductos',ContenedorProductos.getAll())
    
    //Recibo la carga de productos desde un cliente y la
    //emito a todos los demas clientes
    socket.on('ingresoProducto', product => {
        ContenedorProductos.save(product)
        io.sockets.emit('listadoProductos', ContenedorProductos.getAll());
    })
    
    // //Cargo los mensajes previos
    // socket.emit('mensajes', ChatMsjs.getAll());
    
    // //Muestro los nuevos mensajes
    // socket.on('ingresoMensaje', async mensaje => {        
    //     await ChatMsjs.save(mensaje)
    //     io.sockets.emit('mensajes', ChatMsjs.getAll());
    // })
    
})

//Dejo el servidor configurado en el puerto 3000
const PORT=3000
const server=httpServer.listen(PORT,()=>console.log('SERVER ON'));
server.on("error",error=>console.log(`Error en el servido ${error}`))

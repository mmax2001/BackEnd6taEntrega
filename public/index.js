const socket = io(); //Para poder usar sockets desde el cliente


//Capturo los eventos de envio de datos desde el formulario 
//de carga de productos 
const formCargarProd=document.getElementById('loadingForm')
formCargarProd.addEventListener('submit',(e) => {
            e.preventDefault();
            const title = document.getElementsByName("title").item(0).value;
            const price = document.getElementsByName("price").item(0).value;
            const thumbnail = document.getElementsByName("thumbnail").item(0).value;
            const product = {title, price, thumbnail};            
            socket.emit("ingresoProducto",product);
            title.value = "";
            price.value = "";
            thumbnail.value = "";
            // o formCargarProd.reset()
})

//Enciendo el socket cliente para generar la lista de productos
socket.on('listadoProductos',products=>{
    generarTabla(products).then(html=>{
        document.getElementById('productsList').innerHTML=html
    })
})

//Genero la tabla con los productos emitidos desde el servidor
function generarTabla(products) {
    return fetch('/layouts/productsList.hbs')
        .then(respuesta => respuesta.text())
        .then(plantilla => {
            const template = Handlebars.compile(plantilla);
            const html = template({ products })
            return html
        })
}

//Capturo los eventos de envio de datos desde el centro 
//de mensajes 
const formMensajes=document.getElementById('messageCenter')
formMensajes.addEventListener('submit',(e) => {
            e.preventDefault();
            const userName = document.getElementsByName("email").item(0).value;
            const userText = document.getElementsByName("msg").item(0).value;
            const messageTimne = new Date().toLocaleString()
            const userMessage = { msgName: userName, msgText: userText, msgTime: messageTimne};            
            socket.emit("ingresoMensaje",userMessage);
            console.log(userMessage)
            email.value = "";
            msg.value = "";
            // o formMensajes.reset()
})

socket.on('mensajes', mensajes => {
    console.log("ESTOS SON LOS MENSAJES",mensajes);
    const html = generarChat(mensajes)
    document.getElementById('listMessages').innerHTML = html;
})

function generarChat(mensajes) {
    console.log("EL MENSAJE ES",mensajes)
    return mensajes.map(mensaje => {
        return (`
            <div>
                <b style="color:blue;">${mensaje.msgName}</b>
                [<span style="color:brown;">${mensaje.msgTime}</span>] :
                <i style="color:green;">${mensaje.Text}</i>
            </div>
        `)
    }).join(" ");
}

//Configuro los campos del chat para habilitar el
//ingreso de texto si se ingreso el email y luego el envio del 
//mensaje si se ingreso el texto correspondiente
const userName = document.getElementById('email')
const userText = document.getElementById('msg')
const btnEnviar = document.getElementById('sendButton')
userName.addEventListener('input', () => {
    const hayEmail = userName.value.length
    console.log(hayEmail)
    const hayTexto = userText.value.length
    userText.disabled = !hayEmail
    btnEnviar.disabled = !hayEmail && !hayTexto
})

userText.addEventListener('input', () => {
    const hayTexto = userText.value.length
    btnEnviar.disabled = !hayTexto
})





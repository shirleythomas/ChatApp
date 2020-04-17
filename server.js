const express = require("express")
const bodyParser = require('body-parser');
const app = express()
const port = 3000

// Set template engine
app.set("view engine","ejs")

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => 
    res.render("pages/index",{"pagename":"login","title":"Simple Chat Login"})
)

app.post('/home', (req, res) => {
    console.log(req.body);
    //res.status(200).json({"pagename":"chat","title":"Simple Chat App"});
    res.render("pages/index",{"pagename":"chat","title":"Simple Chat App"});
});

app.get('/register', (req, res) => {
    //console.log(req);
    res.render("pages/index",{"pagename":"register","title":"New User Account"});
});

app.post('/createuser', (req, res) => {
    //console.log(req);
    res.redirect("/");
});

// Instantiate server
server = app.listen(port, () => console.log('App listening at http://localhost:${port}'))

const io = require("socket.io")(server)

io.on('connection',(socket)=>{
    console.log("New User Connected.")

    // Listen to the new message from client
    socket.on('new_message', (data) => {
        //broadcast the new message
        io.sockets.emit('send_message', {message : data.message, username : data.username});
    })

    // Listen to the typing event
    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : data.username})
    })
})
var express = require('express');
var app = express();
var logger = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var apiRouter = express.Router();
var micomEmulator = require('./app/js/device/micom');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../dcy11-frontend/build/')));

var isConnected = false;
var micomClient = new micomEmulator();

var micomMessages = [];

(async function() {
    try {
        micomClient.on('micom-message', data => {
            console.error('message arrived');
            console.log(JSON.stringify(data));
            io.sockets.emit('micom-message', data);
	        micomMessages.push(data);
        });
        
        await micomClient.connectPromise();
        isConnected = true;
    } catch(err) {
        console.error(err);
        isConnected = false;
    }
})();


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \
     Authorization');
    next();
});


apiRouter.use(function (req, res, next) {

    console.log('Somebody just came to our app!');

    next();
});

apiRouter.route('/connection').get(async function (req, res) {
    if (!isConnected) {
        try {
            await micomClient.connectPromise();
            isConnected = true;
            res.json({ connection: isConnected });
        } catch(err) {
            isConnected = false;
            res.json({ connection: isConnected });
        }
    }
    else {
        res.json({ connection: isConnected }); 
    }
});

app.use('/api', apiRouter);

io.on('connection', function(socket) {
    console.log('socket.io connected');
    socket.on('micom-status', data => {
        socket.emit('micom-connect', isConnected);
        micomMessages.forEach(value => {
            socket.emit('micom-message', value);
        });
    });
    socket.on('disconnect', () => console.log('socket.io disconnected'));
});



http.listen(1337);
console.log('Starting Server');

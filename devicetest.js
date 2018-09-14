var micomEmulator = require('./app/js/device/micom');
var isConnected = false;

let micomClient = new micomEmulator();

if (!isConnected) {
    micomClient.connectPromise().then(function(result) {
        isConnected = true;
        console.log(result);
    }, function(err) {
        isConnected = false;
    })
}

micomClient.on('micom-message', data => {
    console.log(data);
});

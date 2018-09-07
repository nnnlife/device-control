var micomEmulator = require('./app/js/device/worker')
var isConnected = false;

if (!isConnected) {
    micomEmulator.connectToMicom().then(function(result) {
        isConnected = true;
        console.log('OK');
    }, function(err) {
        isConnected = false;
    })
}

console.log('connection ' + isConnected);
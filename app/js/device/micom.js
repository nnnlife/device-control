const EventEmitter = require('events').EventEmitter;
const {spawnSync} = require('child_process');
var net = require('net');
var client = new net.Socket();


class Micom extends EventEmitter {
    constructor() {
        super();
        this.connectPromise = this.connectPromise.bind(this);
        this.client = new net.Socket();
        let buffer = Buffer.alloc(0);
        this.client.on('data', data=> {
            buffer = Buffer.concat([buffer, data], buffer.length + data.length);
            
            while (buffer.length > 0 && buffer.length >= buffer.readInt32BE(0) + 4) {
                let size = buffer.readInt32BE(0);
                let message = buffer.slice(4, 4 + size);
                buffer = buffer.slice(4 + size, buffer.length);
                console.log('emit message');
                // AP to MICOM direction: 1, MICOM to AP direction: 0
                this.emit('micom-message', {command: message.readInt16BE(1), direction: 1, payload: message.slice(4, message.length - 1)});
            }
        });
        this.client.on('close', () => {
            console.log('Connection Closed');
            this.emit('close');
        });
    }

    connectPromise() {
        return new Promise((resolve, reject) => {
        let result = spawnSync('adb', ['forward', 'tcp:0', 'tcp:33451']);
        let port = parseInt(result['stdout']);
            if (port) {
                this.client.connect(port, 'localhost', function() {
                    console.log('Connected to micom port');
                    resolve(true);
                });
            }
            else {
                reject('Cannot connect to adb');
            }
        });
    }
}


module.exports = Micom;
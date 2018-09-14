const EventEmitter = require('events').EventEmitter;
const {spawnSync} = require('child_process');
var net = require('net');
let rules = require('../message_rules').ask_rules;
var client = new net.Socket();


class Micom extends EventEmitter {
    constructor() {
        super();
        this.connectPromise = this.connectPromise.bind(this);

        this.client = new net.Socket();
        let buffer = Buffer.alloc(0);
        this.client.on('data', data=> {
            buffer = Buffer.concat([buffer, data], buffer.length + data.length);
            
            while (buffer.length >= 4 && buffer.length >= buffer.readUInt8(3) + 5) {
                let message_length = buffer.readUInt8(3);
                console.log('emit message');
                // AP to MICOM direction: 1, MICOM to AP direction: 0
                let one_message = {command: buffer.readInt16BE(1), direction: 1, payload: buffer.slice(4, 4 + message_length)}
                this.emit('micom-message', one_message);
                buffer = buffer.slice(message_length + 5, buffer.length);
                this.checkAutoResponseMessage(one_message);
            }
        });
        this.client.on('close', () => {
            console.log('Connection Closed');
            this.emit('close');
        });
    }

    comparePayload(ruleArray, msgArray) {
        if (ruleArray.length <= msgArray.length) {
            for(let i = 0; i < ruleArray.length; ++i) {
                if (ruleArray[i] !== msgArray[i]) return false;
            }
            return true;
        }
        return false;
    }

    checkAutoResponseMessage(message) {
        for (let i = 0; i < rules.length; ++i) {
            let data = rules[i];
            if (message.command === data.tx.command) {
                if (this.comparePayload(data.tx.payload, message.payload)) {
                    this.sendData(data.rx);
                    break;
                }
            }
        }
    }

    sendData(micomMessage) {
        let buffer = Buffer.alloc(micomMessage.payload.length + 5);
        console.log('bufsize: ', buffer.length, micomMessage.command);
        buffer[0] = 0xAA;
        let c1 = (micomMessage.command & 0xff00) >> 8;
        let c2 = (micomMessage.command & 0xff);
        buffer.writeUInt8(c1, 1);
        buffer.writeUInt8(c2, 2);
        buffer.writeUInt8(micomMessage.payload.length, 3);
        for (let i = 0; i < micomMessage.payload.length; ++i) {
            buffer[4 + i] = micomMessage.payload[i];
        }
        let chksum = 0;
        for (let i = 0; i < buffer.length - 1; ++i) {
            chksum = chksum ^ buffer[i];
        }
        buffer[micomMessage.payload.length + 4] = chksum;
        this.client.write(buffer);
        console.log('SEND DATA TO MICOM');
        this.emit('micom-message', micomMessage);
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
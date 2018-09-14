let fs = require('fs');

let message_rules = JSON.parse(fs.readFileSync('message_rules.json'));

function getPayloadSize(payload) {
    if (payload.hasOwnProperty('size')) {
        if (typeof payload.size === 'string')
        {
            return parseInt(payload.size, 16);
        }
        return payload.size;
    }
    return 0;
}

function filtering_get() {
    let ask_array = [];
    try {
        fs.lstatSync('./ask_rules.json');
        ask_array = JSON.parse('./ask_rules.json');
    }
    catch (e) {
        rules_array = message_rules.rules;
        let ask = [];
        rules_array.forEach(function(item, index, array) {
            if (item.commands.hasOwnProperty('get') &&
                    item.commands.get.hasOwnProperty('defaultValues') &&
                    item.commands.get.defaultValues.length > 0) {
                for (let i = 0; i < item.commands.get.defaultValues.length; i++) {
                    let defaults = item.commands.get.defaultValues[i];
                    if (defaults.hasOwnProperty('if')) {
                        var intArray = defaults.if[0].values.map(item => parseInt(item));
                        console.log(item.commands.get.rx.id, 'type', typeof item.commands.get.rx.payload.size, item.commands.get.rx.payload.size);
                        ask_array.push({
                            name: item.name,
                            tx: {
                                command: parseInt(item.commands.get.tx.id, 16),
                                payloadSize: getPayloadSize(item.commands.get.tx.payload),
                                payload: intArray.length > 0? intArray:[],
                            },
                            rx: {
                                command: parseInt(item.commands.get.rx.id, 16),
                                payloadSize: getPayloadSize(item.commands.get.rx.payload),
                                payload: defaults.then[0].values.map(item =>parseInt(item)),
                            },
                        });
                    }
                    else if (defaults.hasOwnProperty('then')) {
                        ask_array.push({
                            name: item.name,
                            tx: {
                                command: parseInt(item.commands.get.tx.id, 16),
                                payloadSize: 0,
                                payload: [],
                            },
                            rx: {
                                command: parseInt(item.commands.get.rx.id, 16),
                                payloadSize: getPayloadSize(item.commands.get.tx.payload),
                                payload: defaults.then[0].values.map(item =>parseInt(item)),
                            },
                        });
                    }
                }
            }
        });
        fs.writeFileSync('./ask_rules.json', JSON.stringify(ask_array));
    }
    
    return ask_array;
}


let ask_rules = filtering_get();

module.exports = {ask_rules};
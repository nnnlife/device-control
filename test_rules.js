let fs = require('fs');
let rules = require('./app/js/message_rules').ask_rules;


function compareIf(messageArray, stringArray) {
    let intArray = stringArray.map(item => parseInt(item));
    console.log('intArray ', intArray);
    if (intArray.length <= messageArray.length) {
        let slicedArray = messageArray.slice(0, intArray.length);
        for (let i = 0; i < intArray.length; i++) {
            if (intArray[i] !== slicedArray[i])
                return false;
        }
        return true;
    }
    return false;
}


console.log(rules);
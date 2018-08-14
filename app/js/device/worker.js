const {spawnSync} = require('child_process');

var connected = false;

function adb_get_micom_connection() {
    result = spawnSync('adb', ['forward', 'tcp:0', 'tcp:33451']);
    return parseInt(result['stdout']);
}

var result = adb_get_micom_connection();
console.log(`result ${result}`);
console.log('nan? ' + isNaN(result));

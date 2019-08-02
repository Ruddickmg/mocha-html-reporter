const _circularImport = require('./circularImport');

const jello = 'Kellogs';

console.log('circular', _circularImport.ahh());

module.exports.jello = jello;

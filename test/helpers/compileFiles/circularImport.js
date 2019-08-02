const _secondCircularImport = require('./secondCircularImport');

const ahh = function () {
  console.log(_secondCircularImport.jello);
};

module.exports.ahh = ahh;

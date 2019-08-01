var _testFileOne = require("./testFileOne");
var _testFileTwo = require("./testFileTwo");

module.exports.testObject = {
  otherTestPhrase: _testFileOne.otherTestPhrase,
  testPhrase: _testFileOne.testPhrase,
  testTest: _testFileTwo.testTest,
};

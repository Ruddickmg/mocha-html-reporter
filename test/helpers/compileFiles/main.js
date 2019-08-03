const _testFileOne = require('./testFileOne');
const _testFileTwo = require('./testFileTwo');

const testingCompiler = function testingCompiler() {
  console.log(_testFileOne.testPhrase, _testFileTwo.testTest, _testFileOne.otherTestPhrase);
};

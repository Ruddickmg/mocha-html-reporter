const _testFileOne = require('./testFileOne');
const _testFileTwo = require('./testFileTwo');
const _testFileThree = require('./testFileThree');

console.log(
  'test phrase', _testFileOne.testPhrase,
  'test test', _testFileTwo.testTest,
  'test object', _testFileThree.testObject,
);

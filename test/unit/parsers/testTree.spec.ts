import { expect } from 'chai';
import { Test } from 'mocha';
import {
  createTestTreeGenerator,
  getTestSuitePaths,
  checkTestTreeEquality,
} from '../../../src/parsers/testTree';
import {
  tests,
  pathToMockTestDirectory,
  expectedTestSuite,
  expectedImage,
} from "../../helpers/expectations";
import { TestSuite } from "../../../src/report/eventHandlers";

describe('testTree', (): void => {
  describe('getTestSuitePaths', (): void => {
    it ('Will parse a string file path to and return it as an array of directory names', (): void => {
      const formatFileName = (num: number): string => `testDir#${num}`;
      const expected = [1,2,3,4,5].map(formatFileName);
      const path = `/${expected.join('/')}/testfile.html`;
      const testDirectory = expected.shift();
      expect(getTestSuitePaths(path, `/${testDirectory}`)).to.eql(expected);
    });
  });

  describe('createTestTreeGenerator', (): void => {
    it('Will build a tree ending with an array of test results', async (): Promise<void> => {
      const testAccumulator = {} as TestSuite;
      const buildTestTree = createTestTreeGenerator(testAccumulator, pathToMockTestDirectory);

      tests.map((test: Test): TestSuite => buildTestTree(test, expectedImage));

      checkTestTreeEquality(testAccumulator, expectedTestSuite);
    });
  });
});

describe('checkTestTreeEquality', (): void => {
  const tree = {
    a: { d:[{ duration: 1}] },
    e: { f: [{ title: 'hello' }, { title: 'world' }] },
  };
  const empty = {};
  const differsInArray =  {
    a: { d:[{ duration: 2 }] },
    e: { f: [{ title: 'hello' }, { title: 'world' }] },
  };
  const differsInDepth =  {
    a: { b: { d:[{ duration: 1}] } },
    e: { f: [{ title: 'hello' }, { title: 'world' }] },
  };
  const differsByString =  {
    a: { b: { d:[{ duration: 1}] } },
    e: { f: [{ title: 'hello' }, { title: 'neighbor'}] },
  };
  it('Will not throw an assertion error when two trees are equal', (): void => {
    expect(checkTestTreeEquality.bind({}, tree, tree))
      .to.not.throw();
  });
  it('Will throw an error when tree\'s differ by array content', () => {
    expect(checkTestTreeEquality.bind({}, tree, differsInArray))
      .to.throw('expected 1 to equal 2');
  });
  it('Will throw an error when there is a difference in object structure', () => {
    expect(checkTestTreeEquality.bind({}, tree, differsInDepth))
      .to.throw('expected [ { duration: 1 } ] to equal undefined');
  });
  it('Will throw an error when one object is empty and another is not', () => {
    expect(checkTestTreeEquality.bind({}, tree, empty))
      .to.throw('expected { d: [ { duration: 1 } ] } to equal undefined');
  });
  it('Will throw an error when there is a difference in strings', () => {
    expect(checkTestTreeEquality.bind({}, tree, differsByString))
      .to.throw();
  });
});
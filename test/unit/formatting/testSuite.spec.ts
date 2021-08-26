import { expect } from 'chai';
import { Test, Suite } from 'mocha';
import {
  checkTestTreeEquality,
  generateTestResultsByPath,
  generateTestResultsBySuite,
} from '../../../src/formatting/testSuite';
import {
  expectedDate,
  expectedImage,
  expectedTestResultsByPath,
  pathToMockTestDirectory,
  tests,
} from '../../helpers/expectations';
import { createTestResultFormatter } from '../../../src/formatting/testResults';
import { FAILED, PASSED } from '../../../src';
import { TestResult } from '../../../src/scripts/formatting/html';

describe('testTree', (): void => {
  describe('generateTestResultsByPath', (): void => {
    [PASSED, FAILED]
      .forEach((state: string): void => {
        const testResultFormatter = createTestResultFormatter(
          pathToMockTestDirectory,
          expectedDate,
          state,
        );
        const formatTest = (test: Test): TestResult => testResultFormatter(test, expectedImage);
        it(`Will build a tree ending with an array of test results grouped by common paths (directory or test suite's) for ${state} tests`, async (): Promise<void> => {
          const testSuite = generateTestResultsByPath(
            tests
              .map(formatTest)
              .map((test: TestResult): TestResult => ({ ...test, state })),
          );
          checkTestTreeEquality(testSuite, expectedTestResultsByPath(state));
        });
      });
  });
  describe('generateTestResultsBySuite', (): void => {
    [PASSED, FAILED]
      .forEach((state: string): void => {
        const testResultFormatter = createTestResultFormatter(
          pathToMockTestDirectory,
          expectedDate,
          state,
        );
        const formatTest = (test: Test): TestResult => testResultFormatter(test, expectedImage);
        it(`will build a tree with an array of test results grouped by test suite for ${state} tests`, (): void => {
          const firstSuite = 'first';
          const secondSuite = 'second';
          const firstTitle = 'hello';
          const secondTitle = 'mellow';
          const thirdTitle = 'jello';
          const firstTest: Test = {
            title: firstTitle,
            state,
            parent: {
              title: firstSuite,
            } as Suite,
          } as Test;
          const secondTest: Test = {
            title: secondTitle,
            state,
            parent: {
              title: secondSuite,
            } as Suite,
          } as Test;
          const thirdTest: Test = {
            title: thirdTitle,
            state,
            parent: {
              title: secondSuite,
            } as Suite,
          } as Test;
          const testResults: Test[] = [
            firstTest,
            secondTest,
            thirdTest,
          ];
          const testSuite = generateTestResultsBySuite(testResults.map(formatTest));
          checkTestTreeEquality(testSuite, {
            [firstSuite]: [
              firstTest,
            ].map(formatTest),
            [secondSuite]: [
              secondTest,
              thirdTest,
            ].map(formatTest),
          });
        });
      });
  });
});

describe('checkTestTreeEquality', (): void => {
  const tree = {
    a: { d: [{ duration: 1 }] },
    e: { f: [{ title: 'hello' }, { title: 'world' }] },
  };
  const empty = {};
  const differsInArray = {
    a: { d: [{ duration: 2 }] },
    e: { f: [{ title: 'hello' }, { title: 'world' }] },
  };
  const differsInDepth = {
    a: { b: { d: [{ duration: 1 }] } },
    e: { f: [{ title: 'hello' }, { title: 'world' }] },
  };
  const differsByString = {
    a: { b: { d: [{ duration: 1 }] } },
    e: { f: [{ title: 'hello' }, { title: 'neighbor' }] },
  };
  it('Doesn\'t throw an assertion error when two trees are equal', (): void => {
    expect(checkTestTreeEquality.bind({}, tree, tree))
      .to.not.throw();
  });
  it('Throws an error when tree\'s differ by array content', () => {
    expect(checkTestTreeEquality.bind({}, tree, differsInArray))
      .to.throw('expected 1 to equal 2');
  });
  it('Throws an error when tree\'s differ by array content reversed', () => {
    expect(checkTestTreeEquality.bind({}, differsInArray, tree))
      .to.throw('expected 2 to equal 1');
  });
  it('Throws an error when there is a difference in object structure', () => {
    expect(checkTestTreeEquality.bind({}, tree, differsInDepth))
      .to.throw('expected [ { duration: 1 } ] to equal undefined');
  });
  it('Throws an error when there is a difference in object structure reversed', () => {
    expect(checkTestTreeEquality.bind({}, differsInDepth, tree))
      .to.throw('expected { d: [ { duration: 1 } ] } to equal undefined');
  });
  it('Throws an error when it\'s second argument is empty and another is not', () => {
    expect(checkTestTreeEquality.bind({}, tree, empty))
      .to.throw('expected { d: [ { duration: 1 } ] } to equal undefined');
  });
  it('Throws an error when it\'s first argument is empty and another is not', () => {
    expect(checkTestTreeEquality.bind({}, empty, tree))
      .to.throw('expected undefined to equal { d: [ { duration: 1 } ] }');
  });
  it('Throws an error when there is a difference in strings', () => {
    expect(checkTestTreeEquality.bind({}, tree, differsByString))
      .to.throw();
  });
  it('Throws an error when there is a difference in strings reversed', () => {
    expect(checkTestTreeEquality.bind({}, differsByString, tree))
      .to.throw();
  });
});

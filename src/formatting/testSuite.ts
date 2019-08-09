import { expect } from 'chai';
import { isArray, isNumber, isString } from '../utilities/typeChecks';
import { SUITE_UUID, UUID } from '../constants/constants';
import { TestResult, TestSuite } from '../report/eventHandlers';

export const generateTestResultsByPath = (
  testResults: TestResult[],
): TestSuite => testResults
  .reduce((testSuite, test) => {
    let lastDirectory = testSuite as TestSuite;
    const { suite, path } = test;
    const buildTestResults = (directory: string): void => {
      if (!lastDirectory[directory]) {
        lastDirectory[directory] = {};
      }
      lastDirectory = lastDirectory[directory] as TestSuite;
    };
    path.forEach(buildTestResults);
    const suiteDirectory = lastDirectory[suite] as TestResult[];
    lastDirectory[suite] = isArray(suiteDirectory)
      ? [...suiteDirectory, test]
      : [test];
    return testSuite;
  }, {} as TestSuite);

export const generateTestResultsBySuite = (
  testResults: TestResult[],
): TestSuite => testResults
  .reduce((testSuite: TestSuite, test: TestResult): TestSuite => {
    const suiteName = test.suite;
    return {
      ...testSuite,
      [suiteName]: [
        ...((testSuite[suiteName] || []) as TestResult[]),
        test,
      ],
    };
  }, {} as TestSuite);

export const checkTestTreeEquality = (
  test1: any,
  test2: any,
): void => {
  if (!test1 || !test2 || isString(test1) || isNumber(test1)) {
    expect(test1).to.equal(test2);
  } else {
    new Set(Object.keys(test1).concat(Object.keys(test2)))
      .forEach((directory: string): void => {
        if (directory !== UUID && directory !== SUITE_UUID) {
          checkTestTreeEquality(
            test1[directory],
            test2[directory],
          );
        }
      });
  }
};

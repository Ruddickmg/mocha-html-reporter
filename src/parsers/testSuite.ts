import { expect } from 'chai';
import { isArray, isString, isNumber } from '../utilities/typeChecks';
import { UUID, SUITE_UUID } from '../constants';
import { TestSuite, TestResult } from '../report/eventHandlers';

export const generateTestResultsByPath = (
  testResults: TestResult[],
): TestSuite => testResults
  .reduce((testSuite, test) => {
    let lastDirectory = testSuite as TestSuite;
    let suiteDirectory: TestSuite | TestResult[];
    const suite = test.suite;
    const { path } = test;
    const buildTestResults = (directory: string): void => {
      if (!lastDirectory[directory]) {
        lastDirectory[directory] = {};
      }
      lastDirectory = lastDirectory[directory] as TestSuite;
    };
    path.forEach(buildTestResults);
    suiteDirectory = lastDirectory[suite] as TestResult[];
    lastDirectory[suite] = isArray(suiteDirectory)
      ? [...suiteDirectory, test]
      : [test];
    return testSuite;
  }, {});

export const generateTestResultsBySuite = (
  testResults: TestResult[],
): TestSuite => testResults
  .reduce((testSuite: TestSuite, test: TestResult) => {
    const suiteName = test.suite;
    return {
      ...testSuite,
      [suiteName]: [
        ...((testSuite[suiteName] || []) as TestResult[]),
        test,
      ],
    };
  }, {});

export const checkTestTreeEquality = (
    test1: any,
    test2: any,
  ): void => {
    if (!test1 || !test2 || isString(test1) || isNumber(test1)) {
      expect(test1).to.equal(test2);
    }  else {
      new Set(Object.keys(test1).concat(Object.keys(test2)))
        .forEach((directory: string): void => {
          directory !== UUID &&
          directory !== SUITE_UUID &&
          checkTestTreeEquality(
            test1[directory],
            test2[directory],
          )
        });
    }
  };
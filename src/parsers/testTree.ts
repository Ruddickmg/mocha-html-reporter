import { Test } from 'mocha';
import {
  EMPTY_STRING,
  PATH_SEPARATOR,
} from "../utilities/constants";
import {
  formatTestResults,
} from "./formatting";
import { isArray, isString, isNumber } from "util";
import { expect } from "chai";
import {TestSuite, TestResult } from "../report/eventHandlers";

export type TestTreeGenerator = (test: Test, image?: string) => TestSuite;

export const getTestSuitePaths = (
  pathToFile: string,
  pathToTestDirectory?: string,
): string[] => {
  const path = (
    !!pathToTestDirectory
      ? pathToFile.split(pathToTestDirectory).pop()
      : pathToFile
  ).split(PATH_SEPARATOR);
  path.pop();
  return path.filter((directoryName: string): boolean => directoryName !== EMPTY_STRING);
};

export const createTestTreeGenerator = (
  testSuite: TestSuite,
  pathToTestDirectory?: string,
): TestTreeGenerator => (
  test: Test,
  image?: string,
): TestSuite => {
  let lastDirectory = testSuite;
  const path = getTestSuitePaths(test.file, pathToTestDirectory);
  const formattedResults = formatTestResults(test, image);
  const buildTestResults = (directory: string): void => {
    if (!lastDirectory[directory]) {
      lastDirectory[directory] = {};
    }
    lastDirectory = lastDirectory[directory] as TestSuite;
  };

  path.forEach(buildTestResults);

  lastDirectory[test.title] = isArray(lastDirectory)
    ? [...lastDirectory, formattedResults]
    : [formattedResults];

  return testSuite;
};

export const checkTestTreeEquality = (
    test1: TestSuite,
    test2: TestSuite,
  ): void => {
    if (!test1 || !test2 || isString(test1) || isNumber(test1)) {
      expect(test1).to.equal(test2);
    } else if (isArray(test1)) {
      expect(isArray(test2)).to.equal(true);
      (test1 as TestResult[])
        .forEach((value, index): void => checkTestTreeEquality(value, test2[index] as TestSuite));
    } else {
      Object.keys(test1)
        .forEach((directory: string): void => checkTestTreeEquality(
          test1[directory] as TestSuite,
          test2[directory] as TestSuite,
        ));
    }
  };
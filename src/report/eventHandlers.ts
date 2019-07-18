import { Runner, Test } from 'mocha';
import { handleFailedScreenShot, takeScreenShot } from '../utilities/screenshots';
import { writeToFile } from '../utilities/fileSystem';
import { Templates } from '../templates';
import { convertReportToHtml } from './htmlConversion';
import { DELAY_START_PROPERTY } from '../constants';
import { createTestResultFormatter } from '../parsers/formatting';
import {generateTestResultsByPath, generateTestResultsBySuite} from '../parsers/testSuite';

export interface Content {
  [name: string]: string;
}

export interface TestSuite {
  [directory: string]: TestSuite | TestResult[] | Content;
}

export interface TestResult {
  [property: string]: string | string[] | number | TestResult;
  duration: string | number;
  id: string;
  image?: string;
  path: string[];
  suite: string;
  suiteId: string;
  title: string;
}

export interface TestHandlers {
  [handlerName: string]: TestHandler;
}

export type TestHandler = (
  test?: Test,
  error?: Error,
) => void;

export interface ReportData {
  [value: string]: string;
  reportTitle: string;
  pageTitle: string;
  styles: string;
}

export const delayStart = (runner: Runner): void => {
  runner[DELAY_START_PROPERTY] = true;
};

export const setTestEventHandlers = (
  runner: Runner,
  handlers: TestHandlers,
): void => Object
  .keys(handlers)
  .forEach((
    action: string,
  ): Runner => runner.on(action, handlers[action]));

export const createTestHandler = (
  testResults: TestResult[],
  testDirectory: string,
  captureScreen: boolean,
): TestHandler => {
  const formatTestResults = createTestResultFormatter(testDirectory);
  return (
    test: Test,
  ): Promise<TestResult[]> => new Promise((resolve) => {
    const updateTests = (image?: string): void => {
      testResults.push(formatTestResults(test, image));
      resolve(testResults);
    };
    captureScreen
      ? takeScreenShot()
        .then(updateTests)
        .catch((): Promise<void> => handleFailedScreenShot()
          .then(updateTests))
      : updateTests();
  });
};

export const createReportHandler = (
  tests: TestResult[],
  pathToOutputFile: string,
  reportData: ReportData,
  templates: Templates,
): TestHandler => async (): Promise<void[]> => {
  // TODO change tests to accomodate multiple path/output options
  const testSuite = generateTestResultsByPath(tests);
  const html = convertReportToHtml(reportData, testSuite, templates);
  return Promise.all([ writeToFile(pathToOutputFile, html) ]);
};
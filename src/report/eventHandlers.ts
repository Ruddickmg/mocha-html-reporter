import { Runner, Test } from 'mocha';
import { handleFailedScreenShot, takeScreenShot } from '../utilities/screenshots';
import { writeToFile } from '../utilities/fileSystem';
import {
  cleanAndMinifyHtml,
  convertHistoryToHtml,
  convertSuitesToHtml,
  minifyJs,
} from './htmlConversion';
import { DELAY_START_PROPERTY } from '../constants/constants';
import { createTestResultFormatter } from '../formatting/testResults';
import { formatHistory, groupTestSuitesByDate } from '../formatting/historyFormatting';
import { addValuesToTemplate } from '../templates/all';

export interface Content {
  [name: string]: string;
}

export interface TestSuite {
  [directory: string]: TestSuite | TestResult[] | Content | string;
}

export interface TestResult {
  duration: number;
  date: number;
  id: string;
  image?: string;
  path: string[];
  class?: string;
  suite: string;
  state: string;
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
  reportTitle: string;
  pageTitle: string;
  styles?: string;
  scripts?: string;
  history?: TestResult[];
}

export const delayStart = (runner: Runner): void => {
  // eslint-disable-next-line no-param-reassign
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
  timeOfTest: number,
  state: string,
): TestHandler => {
  const formatTestResults = createTestResultFormatter(testDirectory, timeOfTest, state);
  return (
    test: Test,
  ): Promise<TestResult[]> => new Promise((resolve): void => {
    const updateTests = (image?: string): void => {
      testResults.push(formatTestResults(test, image));
      resolve(testResults);
    };
    if (captureScreen) {
      takeScreenShot()
        .then(updateTests)
        .catch((): Promise<void> => handleFailedScreenShot()
          .then(updateTests));
    } else {
      updateTests();
    }
  });
};

export const createReportHandler = (
  tests: TestResult[],
  pathToOutputFile: string,
  {
    history,
    styles,
    scripts,
    ...reportData
  }: ReportData,
  generateTestSuite: (tests: TestResult[]) => TestSuite,
): TestHandler => async (): Promise<void[]> => {
  const allTests = [...tests, ...history];
  const formattedHistory = formatHistory(allTests);
  const htmlHistory = convertHistoryToHtml(formattedHistory);
  const testsGroupedByDate = groupTestSuitesByDate(allTests);
  const htmlSuites = convertSuitesToHtml(
    reportData,
    testsGroupedByDate
      .map(generateTestSuite),
  );
  const report = addValuesToTemplate(htmlSuites, {
    history: htmlHistory,
    scripts: minifyJs(scripts),
    styles,
  });
  return Promise
    .all([
      writeToFile(pathToOutputFile, cleanAndMinifyHtml(report)),
    ]);
};

import { Runner, Test } from 'mocha';
import { handleFailedScreenShot, takeScreenShot } from '../utilities/screenshots';
import { writeToFile } from '../utilities/fileSystem';
import { convertHistoryToHtml, convertSuitesToHtml } from './htmlConversion';
import { DELAY_START_PROPERTY } from '../constants/constants';
import {createTestResultFormatter, removeFileName} from '../parsers/formatting';
import { groupTestSuitesByDate, formatHistory } from '../history/historyFormatting';
import { addValuesToTemplate } from '../templates/all';
import { writeHistory } from '../history/storage';
import {flattenArray} from "../utilities/arrays";

export interface Content {
  [name: string]: string;
}

export interface TestSuite {
  [directory: string]: TestSuite | TestResult[] | Content;
}

export interface TestResult {
  [property: string]: string | string[] | number | TestResult;
  duration: string | number;
  date: number;
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
  reportTitle: string;
  pageTitle: string;
  styles?: Promise<string>;
  history?: Promise<TestResult[]>;
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
  { history, styles, ...reportData }: ReportData,
  generateTestSuite: (tests: TestResult[]) => TestSuite,
): TestHandler => async (): Promise<void[]> => {
  const allTests = [...tests, ...await history];
  const formattedHistory = formatHistory(allTests);
  const htmlHistory = convertHistoryToHtml(formattedHistory);
  const testsGroupedByDate = groupTestSuitesByDate(allTests);
  const htmlSuites = convertSuitesToHtml(
    reportData,
    testsGroupedByDate
      .map(generateTestSuite),
  );
  const reportWithHistory = addValuesToTemplate(htmlSuites, {
    history: htmlHistory,
    styles: await styles,
  });
  return Promise
    .all([
      writeToFile(pathToOutputFile, reportWithHistory),
      writeHistory(
        removeFileName(pathToOutputFile),
        flattenArray(testsGroupedByDate),
      ),
    ]);
};

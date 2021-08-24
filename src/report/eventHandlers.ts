import { Runner, Test } from 'mocha';
import { handleFailedScreenShot, takeScreenShot } from '../utilities/screenshots';
import { writeToFile } from '../utilities/fileSystem';
import { cleanAndMinifyHtml, minifyJs } from './htmlConversion';
import { DELAY_START_PROPERTY } from '../constants/index';
import { createTestResultFormatter } from '../formatting/testResults';
import { addValuesToTemplate, reportTemplate } from '../templates';
import { ReportData, TestResult } from '../scripts/formatting/html';

export interface Data {
  data: string;
}

export interface TestHandlers {
  [handlerName: string]: TestHandler;
}

export type TestHandler = (
  test?: Test,
  error?: Error,
) => void;

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
): TestHandler => async (): Promise<void[]> => {
  const report = addValuesToTemplate(reportTemplate, {
    ...reportData,
    data: JSON.stringify([...tests, ...history]),
    scripts: minifyJs(scripts),
    styles,
  });
  return Promise
    .all([
      writeToFile(pathToOutputFile, cleanAndMinifyHtml(report)),
    ]);
};

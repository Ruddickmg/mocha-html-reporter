import { Runner, Test } from 'mocha';
import { writeToFile } from '../utilities/fileSystem';
import { createTestResultFormatter } from '../formatting/testResults';
import { handleFailedScreenShot, takeScreenShot } from '../utilities/screenshots';
import { convertMillisecondsToDate, getMonthDayYearFromDate } from '../formatting/time';
import { FINISHED } from '../constants/constants';
import { compose } from '../utilities/functions';
import { DELAY_START_PROPERTY } from '../constants/mocha';
import { reportTemplate, ReportInput } from '../templates/report.html';

export interface Content {
  [name: string]: string;
}

export interface TestSuite {
  [directory: string]: TestSuite | TestResult[] | Content | string;
}

export interface History {
  [date: string]: TestResult[];
}

export type TestHandler = (
  test?: Test,
  error?: Error,
) => Promise<void>;

export interface TestHandlers {
  [handlerName: string]: TestHandler;
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

export const createTestHandler = (
  tests: TestResult[],
  history: History,
  reportData: ReportInput,
  pathToOutputFile: string,
  timeOfTest: number,
  state: string,
  captureScreen: boolean,
): TestHandler => {
  const formatTestResult = createTestResultFormatter(
    pathToOutputFile,
    timeOfTest,
    state,
  );
  const date = getMonthDayYearFromDate(convertMillisecondsToDate(timeOfTest));
  const data = history;
  return async (test: Test): Promise<void> => {
    let image: string;
    if (captureScreen) {
      try {
        image = await takeScreenShot();
      } catch (error) {
        image = await handleFailedScreenShot();
      }
    }
    const testResult = formatTestResult(test, image);
    tests.push(testResult);
    data[date] = tests;
    return writeToFile(
      pathToOutputFile,
      reportTemplate({
        ...reportData,
        data: JSON.stringify(data),
      }),
    );
  };
};

export const handleMochaEvents = (
  runner: Runner,
  handlers: TestHandlers,
): void => {
  const allTests: Promise<void>[] = [];
  const addTestToCue = (testHandlerResult: Promise<void>): Promise<void>[] => {
    allTests.push(testHandlerResult);
    return allTests;
  };
  const waitForTestsBeforeFinish = async (): Promise<void> => {
    await Promise.all(allTests);
    runner.emit(FINISHED);
  };
  delayStart(runner);
  Object
    .keys(handlers)
    .forEach((
      action: string,
    ): Runner => runner.on(action, compose(handlers[action], addTestToCue)));
  runner.run(waitForTestsBeforeFinish); // TODO may need 'runSuite' test this.
};

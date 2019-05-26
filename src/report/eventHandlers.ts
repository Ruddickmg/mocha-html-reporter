import { Runner, Test } from "mocha";
import { createTestTreeGenerator } from "../parsers/testTree";
import { handleFailedScreenShot, takeScreenShot } from "../utilities/screenshots";
import { writeToFile } from "../utilities/fileSystem";
import {Templates, TemplateValues} from "../parsers/templating";
import { convertReportToHtml } from "./htmlConversion";
import {DELAY_START_PROPERTY} from "../utilities/constants";

export interface TestSuite extends TemplateValues {
  results?: TestResult[];
}

export interface TestResult extends TemplateValues {
  [name: string]: string;
  title: string;
  duration: string;
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
  testSuite: TestSuite,
  testDirectory: string,
  captureScreen: boolean,
): TestHandler => {
  const updateTestSuite = createTestTreeGenerator(
    testSuite,
    testDirectory,
  );
  return (
    test: Test,
  ): Promise<TestSuite> => new Promise((resolve) => {
    const updateTests = (image?: string): void => resolve(updateTestSuite(test, image));
    captureScreen
      ? takeScreenShot()
        .then(updateTests)
        .catch((): Promise<void> => handleFailedScreenShot()
          .then(updateTests))
      : updateTests();
  });
};

export const createReportHandler = (
  tests: TestSuite,
  pathToOutputFile: string,
  reportData: ReportData,
  templates: Templates,
): TestHandler => (): void => {
  const html = convertReportToHtml(reportData, tests, templates);
  writeToFile(pathToOutputFile, html)
    .catch((error): void => {
      throw Error(`Could not create ${pathToOutputFile}, something went wrong:\n - ${error}`);
    });
};
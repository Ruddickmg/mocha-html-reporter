import { Test, Runner } from 'mocha';
import { expect } from 'chai';
import { spy } from 'sinon';
import { mkdirSync } from 'fs';
import {
  createReportHandler,
  createTestHandler,
  delayStart,
  ReportData,
  setTestEventHandlers,
  TestHandlers,
  TestResult,
} from '../../../src/report/eventHandlers';
import {
  pathToMockTestDirectory,
  tests,
} from '../../helpers/expectations';
import {
  addValuesToTemplate,
  reportTemplate,
  testSuiteTemplate,
  testResultTemplate,
  imageTemplate,
} from '../../../src/templates/all';
import { getFileContents } from '../../../src/utilities/fileSystem';
import {
  PATH_TO_PACKAGE,
  TEST_DIRECTORY,
} from '../../../src/constants/constants';
import { createTestResultFormatter, formatDuration } from '../../../src/parsers/formatting';
import { base64NoImageString } from '../../../src/constants/base64NoImageString';
import { isString } from '../../../src/utilities/typeChecks';
import { generateTestResultsByPath, generateTestResultsBySuite } from '../../../src/parsers/testSuite';

const { remove } = require('fs-extra');

describe('eventHandlers', (): void => {
  const pathToMockHtml = `${PATH_TO_PACKAGE}/${TEST_DIRECTORY}/unit/html`;
  const fileName = 'morphius';
  const pathToMockFile = `${pathToMockHtml}/${fileName}.html`;
  const removeAndCheckIds = (results: TestResult[]) => results.map(({ id, suiteId, ...result }: TestResult): any => {
    expect(isString(id)).to.equal(true);
    expect(isString(suiteId)).to.equal(true);
    return result;
  });

  beforeEach(() => mkdirSync(pathToMockHtml));
  afterEach(() => remove(pathToMockHtml));

  describe('delayStart', (): void => {
    it('Will set a property on the passed in test runner preventing it from auto starting the tests', (): void => {
      const runner = {} as Runner;
      delayStart(runner);
      expect(runner).to.eql({ _delay: true });
    });
  });
  describe('setTestEventHandlers', (): void => {
    it('Will set the actions/handlers of the test runner event\'s', (): void => {
      const action = 'doTheThing';
      const on = spy();
      const handlers = {
        [action]: 'functionPlaceHolder',
      };
      const runner = { on } as unknown;
      setTestEventHandlers(
        runner as Runner,
        (handlers as unknown) as TestHandlers,
      );
      expect(on.calledWith(action, handlers[action])).to.eql(true);
    });
  });
  describe('createTestHandler', (): void => {
    it('Parses tests into the correct output', (): void => {
      const testResults: TestResult[] = [];
      const takeScreenShot = false;
      const formatTestResults = createTestResultFormatter(pathToMockTestDirectory);
      const testHandler = createTestHandler(testResults, pathToMockTestDirectory, takeScreenShot);
      const formattedResults = tests.map((test: Test): TestResult => formatTestResults(test));

      tests.forEach((test: Test): void => testHandler(test));

      expect(removeAndCheckIds(testResults)).to.eql(removeAndCheckIds(formattedResults));
    });
    it('Will parse a test and take a screen shot', async (): Promise<void> => {
      const testResults: TestResult[] = [];
      const takeScreenShot = true;
      const formatTestResults = createTestResultFormatter(pathToMockTestDirectory);
      const testHandler = createTestHandler(testResults, pathToMockTestDirectory, takeScreenShot);
      const formattedResults = tests.map((test: Test): TestResult => formatTestResults(test, base64NoImageString));

      await Promise.all(tests.map((test: Test): void => testHandler(test)));

      expect(removeAndCheckIds(testResults)).to.eql(removeAndCheckIds(formattedResults));
    });
  });
  describe('createReportHandler', (): void => {
    const title = 'best test';
    const suite = 'a suite';
    const path = ['some', 'cool', 'directory'];
    const duration = 0.4;
    const image = 'image'; // base64NoImageString;
    const testResults: TestResult[] = [
      {
        title,
        duration,
        image,
        suite,
        path,
      },
    ] as TestResult[];
    const reportData = {
      reportTitle: 'hello',
      pageTitle: 'world',
      styles: 'styling',
      scripts: 'scripts',
    };
    it('Parses tests correctly into html output by suite', async (): Promise<void> => {
      const reportHandler = createReportHandler(
        testResults,
        pathToMockFile,
        reportData as ReportData,
        generateTestResultsBySuite,
      );
      const suites = [suite]
        .reverse()
        .reduce((content: string, title: string): string => addValuesToTemplate(
          testSuiteTemplate,
          { content, title },
        ), addValuesToTemplate(testResultTemplate, {
          title,
          duration: formatDuration(duration),
          image: addValuesToTemplate(imageTemplate, { image }),
        }));
      const expected = addValuesToTemplate(reportTemplate, { suites, ...reportData });
      await reportHandler();

      expect(await getFileContents(pathToMockFile)).to.equal(expected);
    });
    it('Parses tests correctly into html output by path', async (): Promise<void> => {
      const reportHandler = createReportHandler(
        testResults,
        pathToMockFile,
        reportData as ReportData,
        generateTestResultsByPath,
      );
      const suites = [...path, suite]
        .reverse()
        .reduce((content: string, title: string): string => addValuesToTemplate(
          testSuiteTemplate,
          { content, title },
        ), addValuesToTemplate(testResultTemplate, {
          title,
          duration: formatDuration(duration),
          image: addValuesToTemplate(imageTemplate, { image }),
        }));
      const expected = addValuesToTemplate(reportTemplate, { suites, ...reportData });
      await reportHandler();

      expect(await getFileContents(pathToMockFile)).to.equal(expected);
    });
  });
});

import { remove } from 'fs-extra';
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
  tests, variableNameGenerator,
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
  PASSED,
  PATH_TO_PACKAGE,
  PATH_TO_SCRIPTS,
  PATH_TO_STYLE_SHEET,
  TEST_DIRECTORY,
} from '../../../src/constants/constants';
import { createTestResultFormatter, formatDuration } from '../../../src/parsers/formatting';
import { base64NoImageString } from '../../../src/constants/base64NoImageString';
import { isString } from '../../../src/utilities/typeChecks';
import { generateTestResultsByPath, generateTestResultsBySuite } from '../../../src/parsers/testSuite';
import { getHistory } from '../../../src/history/storage';
import { cleanAndMinifyHtml, convertHistoryToHtml, minifyJs } from '../../../src/report/htmlConversion';
import { formatHistory, groupTestSuitesByDate } from '../../../src/history/historyFormatting';
import { flattenArray } from '../../../src/utilities/arrays';
import { compileCode } from '../../../src/utilities/compiler';
import { getStyles } from '../../../src/parsers/styles';
import { TEST_RESULT, TEST_SUITE } from '../../../src/constants/cssClasses';
import { HIDDEN } from '../../../src/scripts/constants';

describe('eventHandlers', (): void => {
  const pathToMockHtml = `${PATH_TO_PACKAGE}/${TEST_DIRECTORY}/unit/html`;
  const fileName = 'morphius';
  const pathToMockFile = `${pathToMockHtml}/${fileName}.html`;
  const state = PASSED;
  const testResultClass = `${TEST_RESULT} ${state} ${HIDDEN}`;
  const testSuiteClass = `${TEST_SUITE} ${state} ${HIDDEN}`;
  const removeAndCheckIds = (
    results: TestResult[],
  ): any => results
    .map(({ id, suiteId, ...result }: TestResult): any => {
      expect(isString(id)).to.equal(true);
      expect(isString(suiteId)).to.equal(true);
      return result;
    });

  beforeEach((): void => mkdirSync(pathToMockHtml));
  afterEach((): void => remove(pathToMockHtml));

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
    const date = Date.now();
    it('Parses tests into the correct output', (): void => {
      const testResults: TestResult[] = [];
      const takeScreenShot = false;
      const formatTestResults = createTestResultFormatter(pathToMockTestDirectory, date, state);
      const testHandler = createTestHandler(
        testResults,
        pathToMockTestDirectory,
        takeScreenShot,
        date,
        state,
      );
      const formattedResults = tests.map((test: Test): TestResult => formatTestResults(test));

      tests.forEach((test: Test): void => testHandler(test));

      expect(removeAndCheckIds(testResults)).to.eql(removeAndCheckIds(formattedResults));
    });
    it('Will parse a test and take a screen shot', async (): Promise<void> => {
      const testResults: TestResult[] = [];
      const takeScreenShot = true;
      const formatTestResults = createTestResultFormatter(pathToMockTestDirectory, date, state);
      const testHandler = createTestHandler(
        testResults,
        pathToMockTestDirectory,
        takeScreenShot,
        date,
        state,
      );
      const formattedResults = tests
        .map((test: Test): TestResult => formatTestResults(test, base64NoImageString));

      await Promise.all(tests.map((test: Test): void => testHandler(test)));

      expect(removeAndCheckIds(testResults)).to.eql(removeAndCheckIds(formattedResults));
    });
  });
  describe('createReportHandler', (): void => {
    const title = 'best test';
    const suite = 'a suite';
    const path = ['some', 'cool', 'directory'];
    const duration = 4;
    const date = Date.now();
    const image = 'image'; // base64NoImageString;
    const testResults: TestResult[] = [
      {
        title,
        duration,
        image,
        date,
        state,
        suite,
        path,
      },
    ] as TestResult[];
    const reportData: ReportData = {
      reportTitle: 'hello',
      pageTitle: 'world',
    };
    it('Parses tests correctly into html output by suite', async (): Promise<void> => {
      const history = getHistory(pathToMockHtml);
      const styles = getStyles(PATH_TO_STYLE_SHEET);
      const scripts = compileCode(PATH_TO_SCRIPTS, variableNameGenerator());
      const reportHandler = createReportHandler(
        testResults,
        pathToMockFile,
        {
          ...reportData,
          history,
          scripts,
          styles,
        },
        generateTestResultsBySuite,
      );
      const suites = [suite]
        .reverse()
        .reduce((content: string, suiteTitle: string): string => addValuesToTemplate(
          testSuiteTemplate,
          { content, title: suiteTitle, class: testSuiteClass },
        ), addValuesToTemplate(testResultTemplate, {
          title,
          class: testResultClass,
          duration: formatDuration(duration),
          image: addValuesToTemplate(imageTemplate, { image }),
        }));
      const expected = addValuesToTemplate(reportTemplate, {
        suites,
        ...reportData,
        styles: await styles,
        scripts: minifyJs(await scripts),
        history: convertHistoryToHtml(formatHistory([
          ...testResults,
          ...await history,
        ])),
      });
      await reportHandler();

      expect(await getFileContents(pathToMockFile)).to.equal(cleanAndMinifyHtml(expected));
    });
    it('Parses tests correctly into html output by path', async (): Promise<void> => {
      const history = getHistory(pathToMockHtml);
      const styles = getStyles(PATH_TO_STYLE_SHEET);
      const scripts = compileCode(PATH_TO_SCRIPTS, variableNameGenerator());
      const reportHandler = createReportHandler(
        testResults,
        pathToMockFile,
        {
          ...reportData,
          history,
          styles,
          scripts,
        },
        generateTestResultsByPath,
      );
      const suites = [...path, suite]
        .reverse()
        .reduce((content: string, suiteTitle: string): string => addValuesToTemplate(
          testSuiteTemplate,
          { content, title: suiteTitle, class: testSuiteClass },
        ), addValuesToTemplate(testResultTemplate, {
          title,
          class: testResultClass,
          duration: formatDuration(duration),
          image: addValuesToTemplate(imageTemplate, { image }),
        }));
      const expected = addValuesToTemplate(reportTemplate, {
        suites,
        ...reportData,
        styles: await styles,
        scripts: minifyJs(await scripts),
        history: convertHistoryToHtml(formatHistory([
          ...testResults,
          ...await history,
        ])),
      });
      await reportHandler();

      expect(await getFileContents(pathToMockFile)).to.equal(cleanAndMinifyHtml(expected));
    });
    it('Will output history correctly into json', async (): Promise<void> => {
      const history = getHistory(pathToMockHtml);
      const styles = getStyles(PATH_TO_STYLE_SHEET);
      const scripts = compileCode(PATH_TO_SCRIPTS, variableNameGenerator());
      const reportHandler = createReportHandler(
        testResults,
        pathToMockFile,
        {
          ...reportData,
          history,
          scripts,
          styles,
        },
        generateTestResultsBySuite,
      );
      const expected = flattenArray(groupTestSuitesByDate(testResults));
      await reportHandler();

      expect(await getHistory(pathToMockFile)).to.eql(expected);
    });
  });
});

import { remove } from 'fs-extra';
import { Test, Runner } from 'mocha';
import { expect } from 'chai';
import { spy } from 'sinon';
import { mkdirSync } from 'fs';
import {
  createReportHandler,
  createTestHandler,
  delayStart,
  setTestEventHandlers,
  TestHandlers,

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
} from '../../../src/templates';
import { getFileContents, getHistory } from '../../../src/utilities/fileSystem';
import {
  PATH_TO_PACKAGE,
  PATH_TO_SCRIPTS,
  PATH_TO_STYLE_SHEET,
  TEST_DIRECTORY,
} from '../../../src/constants';
import { createTestResultFormatter } from '../../../src/formatting/testResults';
import { base64NoImageString } from '../../../src/constants/base64NoImageString';
import { isString } from '../../../src/scripts/utilities/typeChecks';
import { cleanAndMinifyHtml, minifyJs } from '../../../src/report/htmlConversion';
import { groupTestSuitesByDate } from '../../../src/scripts/formatting/history';
import { flattenArray } from '../../../src/utilities/arrays';
import { compileCode } from '../../../src/compilation';
import { getStyles } from '../../../src/report/styles';
import {
  FAILED,
  PASSED,
  TEST_RESULT,
  TEST_SUITE,
  HIDDEN,
} from '../../../src/scripts/constants';
import { formatDuration } from '../../../src/scripts/formatting/time';
import { ReportData, TestResult } from '../../../src/scripts/formatting/html';

describe('eventHandlers', (): void => {
  const pathToMockHtml = `${PATH_TO_PACKAGE}/${TEST_DIRECTORY}/unit/html`;
  const fileName = 'morphius';
  const pathToMockFile = `${pathToMockHtml}/${fileName}.html`;
  const testResultClass = (state: string): string => `${TEST_RESULT} ${state} ${HIDDEN}`;
  const testSuiteClass = (state: string): string => `${TEST_SUITE} ${state} ${HIDDEN}`;
  const removeAndCheckIds = (
    results: TestResult[],
  ): any => results
    .map(({ id, suiteId, ...result }: TestResult): any => {
      expect(isString(id)).to.equal(true);
      expect(isString(suiteId)).to.equal(true);
      return result;
    });

  beforeEach((): void => mkdirSync(pathToMockHtml));
  afterEach((): Promise<void> => remove(pathToMockHtml));

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
    [PASSED, FAILED]
      .forEach((state: string): any => {
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
  });
  describe('createReportHandler', (): void => {
    const title = 'best test';
    const suite = 'a suite';
    const path = ['some', 'cool', 'directory'];
    const duration = 4;
    const date = Date.now();
    const image = 'image'; // base64NoImageString;
    const reportData: ReportData = {
      reportTitle: 'hello',
      pageTitle: 'world',
    };
    let styles: string;
    let scripts: string;
    let history: TestResult[];

    before(async () => {
      history = await getHistory(pathToMockFile);
      styles = await getStyles(PATH_TO_STYLE_SHEET);
      scripts = await compileCode(PATH_TO_SCRIPTS, variableNameGenerator());
    });

    [PASSED, FAILED]
      .forEach((state: string): void => {
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
        it(`Parses tests correctly into html output by suite for a ${state} test`, async (): Promise<void> => {
          const reportHandler = createReportHandler(
            testResults,
            pathToMockFile,
            {
              ...reportData,
              scripts,
              history: [],
              styles,
            },
          );
          const suites = [suite]
            .reverse()
            .reduce((content: string, suiteTitle: string): string => addValuesToTemplate(
              testSuiteTemplate,
              { content, title: suiteTitle, class: testSuiteClass(state) },
            ), addValuesToTemplate(testResultTemplate, {
              title,
              class: testResultClass(state),
              duration: formatDuration(duration),
              image: addValuesToTemplate(imageTemplate, { image }),
            }));
          const expected = addValuesToTemplate(reportTemplate, {
            suites,
            ...reportData,
            styles,
            scripts: minifyJs(scripts),
            data: JSON.stringify(testResults),
          });
          await reportHandler();

          expect(await getFileContents(pathToMockFile)).to.equal(cleanAndMinifyHtml(expected));
        });
        it(`Parses tests correctly into html output by path for ${state} tests`, async (): Promise<void> => {
          const reportHandler = createReportHandler(
            testResults,
            pathToMockFile,
            {
              ...reportData,
              history: [],
              styles,
              scripts,
            },
          );
          const suites = [...path, suite]
            .reverse()
            .reduce((content: string, suiteTitle: string): string => addValuesToTemplate(
              testSuiteTemplate,
              { content, title: suiteTitle, class: testSuiteClass(state) },
            ), addValuesToTemplate(testResultTemplate, {
              title,
              class: testResultClass(state),
              duration: formatDuration(duration),
              image: addValuesToTemplate(imageTemplate, { image }),
            }));
          const expected = addValuesToTemplate(reportTemplate, {
            suites,
            ...reportData,
            styles,
            data: JSON.stringify(testResults),
            scripts: minifyJs(scripts),
          });
          await reportHandler();

          expect(await getFileContents(pathToMockFile)).to.equal(cleanAndMinifyHtml(expected));
        });
      });
    it('Will output history correctly into json', async (): Promise<void> => {
      const testResults: TestResult[] = [
        {
          title,
          duration,
          image,
          date,
          suite,
          path,
        },
      ] as TestResult[];
      const reportHandler = createReportHandler(
        testResults,
        pathToMockFile,
        {
          ...reportData,
          history,
          scripts,
          styles,
        },
      );
      const expected = flattenArray(groupTestSuitesByDate(testResults));
      await reportHandler();

      expect(await getHistory(pathToMockFile)).to.eql(expected);
    });
  });
});

import { remove } from 'fs-extra';
import { Test, Runner } from 'mocha';
import { expect } from 'chai';
import { spy } from 'sinon';
import { mkdirSync } from 'fs';
import {
  createTestHandler,
  delayStart,
  handleMochaEvents,
  TestHandlers,
  TestResult, History, ReportData,
} from '../../../src/report/eventHandlers';
import {
  pathToMockTestDirectory,
  tests,
} from '../../helpers/expectations';
import {
  EMPTY_STRING,
  FAILED,
  FINISHED,
  PASSED,
  PATH_TO_PACKAGE,
  TEST_DIRECTORY,
} from '../../../src/constants/constants';
import { createTestResultFormatter } from '../../../src/formatting/testResults';
import { base64NoImageString } from '../../../src/constants/base64NoImageString';
import { isString } from '../../../src/utilities/typeChecks';
import { getFileContents } from '../../../src/utilities/fileSystem';
import { reportTemplate } from '../../../src/templates/report.html';
import { wait } from '../../../src/utilities/promises';

describe('eventHandlers', (): void => {
  const pathToMockHtml = `${PATH_TO_PACKAGE}/${TEST_DIRECTORY}/unit/html`;
  const TIME_TO_RESOLVE = 10;
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
  describe('handleMochaEvents', (): void => {
    const value: Promise<void> = new Promise((): void => {});
    const action = 'doTheThing';
    const on = spy();
    const run = spy();
    const emit = spy();
    const handlers = {
      [action]: (): Promise<void> => value,
    } as unknown as TestHandlers;
    const runner = { on, run, emit } as unknown as Runner;
    it('Calls the run method of the test runner', (): void => {
      handleMochaEvents(runner, handlers);
      expect(run.called).to.equal(true);
    });
    it('Will set the actions/handlers of the test runner event\'s', (): void => {
      handleMochaEvents(runner, handlers);
      expect(on.calledWith(action)).to.equal(true);
    });
    it('Will be passed/call the action function for each action', (): void => {
      const testActionFunction = (_: string, actionFunction: any): void => {
        expect(actionFunction()).to.eql([value]);
      };
      handleMochaEvents(
        { ...runner, on: testActionFunction } as unknown as Runner,
        handlers,
      );
    });
    it('Will not emit finished event if there are unresolved async test promises', async (): Promise<void> => {
      const actionFunction = (_: string, fn: any): void => fn(value);
      const testEmit = async (fn: () => Promise<void>): Promise<void> => fn();
      handleMochaEvents({
        ...runner,
        run: testEmit,
        on: actionFunction,
      } as unknown as Runner, handlers);
      await wait(TIME_TO_RESOLVE);
      expect(emit.calledWith(FINISHED)).to.equal(false);
    });
    it('Will emit finished event when all async test promises have resolved', async (): Promise<void> => {
      const resolvedPromise: Promise<void> = Promise.resolve();
      const resolvedHandlers = {
        [action]: (): Promise<void> => resolvedPromise,
      } as unknown as TestHandlers;
      const actionFunction = (_: string, fn: any): void => fn(resolvedPromise);
      const testEmit = async (fn: () => Promise<void>): Promise<void> => fn();
      handleMochaEvents({
        ...runner,
        run: testEmit,
        on: actionFunction,
      } as unknown as Runner, resolvedHandlers);
      await wait(TIME_TO_RESOLVE);
      expect(emit.calledWith(FINISHED)).to.equal(true);
    });
  });
  describe('createTestHandler', (): void => {
    const date = Date.now();
    const reportData = {
      pageTitle: 'testing 123',
      styles: EMPTY_STRING,
      scripts: EMPTY_STRING,
      timeOfTest: date,
      pathToOutputFile: pathToMockTestDirectory,
    } as ReportData;
    [PASSED, FAILED]
      .forEach((state: string): any => {
        it(`Parses tests into the correct output for ${state} tests`, async (): Promise<void> => {
          const testResults: TestResult[] = [];
          const history: History = {};
          const takeScreenShot = false;
          const formatTestResults = createTestResultFormatter(pathToMockTestDirectory, date, state);
          const testHandler = createTestHandler(
            testResults,
            state,
            takeScreenShot,
            {
              history,
              ...reportData,
            },
          );
          const formattedResults = tests.map((test: Test): TestResult => formatTestResults(test));
          await Promise.all(tests.map((test: Test): Promise<void> => testHandler(test)));
          expect(removeAndCheckIds(testResults)).to.eql(removeAndCheckIds(formattedResults));
        });
        it(`Will parse a test and take a screen shot for ${state} tests`, async (): Promise<void> => {
          const testResults: TestResult[] = [];
          const history: History = {};
          const takeScreenShot = true;
          const formatTestResults = createTestResultFormatter(pathToMockTestDirectory, date, state);
          const testHandler = createTestHandler(
            testResults,
            state,
            takeScreenShot,
            {
              history,
              ...reportData,
            },
          );
          const formattedResults = tests
            .map((test: Test): TestResult => formatTestResults(test, base64NoImageString));
          await Promise.all(tests.map((test: Test): Promise<void> => testHandler(test)));
          expect(removeAndCheckIds(testResults)).to.eql(removeAndCheckIds(formattedResults));
        });
        it('Will write output to an output file for each test', async (): Promise<void> => {
          const testResults: TestResult[] = [];
          const history: History = {};
          const takeScreenShot = false;
          const testHandler = createTestHandler(
            testResults,
            state,
            takeScreenShot,
            {
              history,
              ...reportData,
            },
          );
          await tests
            .reduce((previous: Promise<void>, test: Test): Promise<void> => previous
              .then(async (): Promise<void> => {
                await testHandler(test);
                expect(await getFileContents(pathToMockTestDirectory))
                  .to
                  .equal(reportTemplate({
                    ...reportData,
                    data: JSON.stringify(history),
                  }));
              }), Promise.resolve());
        });
      });
  });
});

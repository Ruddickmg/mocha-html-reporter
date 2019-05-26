import {Test, Runner} from 'mocha';
import { expect } from 'chai';
import { spy } from 'sinon';
import {
  createReportHandler,
  createTestHandler, delayStart, ReportData, setTestEventHandlers, TestHandlers,
  TestSuite
} from '../../../src/report/eventHandlers';
import {checkTestTreeEquality} from '../../../src/parsers/testTree';
import {expectedTestSuite, pathToMockTestDirectory, tests} from '../../helpers/expectations';
import {getTemplates} from "../../../src/parsers/templating";
import {getFileContents} from "../../../src/utilities/fileSystem";

describe('eventHandlers', (): void => {
  describe('delayStart', (): void => {
    it('Will set a property on the passed in test runner preventing it from auto starting the tests', (): void => {
      let runner = {} as Runner;
      delayStart(runner);
      expect(runner).to.eql({_delay: true});
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
        runner as Runner ,
        (handlers as unknown) as TestHandlers,
      );
      expect(on.calledWith(action, handlers[action])).to.eql(true);
    });
  });
  describe('createTestHandler', (): void => {
    it('Will parse a test and output a correct output', (): void => {
      const testSuite: TestSuite = {};
      const takeScreenShot = false;
      const testHandler = createTestHandler(testSuite, pathToMockTestDirectory, takeScreenShot);

      tests.forEach((test: Test): void => testHandler(test));

      checkTestTreeEquality(testSuite, expectedTestSuite);
    });
    it('Will parse a test and take a screen shot', async (): Promise<void> => {
      const testSuite: TestSuite = {};
      const takeScreenShot = true;
      const testHandler = createTestHandler(testSuite, pathToMockTestDirectory, takeScreenShot);

      await Promise.all(tests.map((test: Test): void => testHandler(test)));

      checkTestTreeEquality(testSuite, expectedTestSuite);
    });
  });
  describe('createReportHandler', (): void => {
    it('Will correctly parse test data into html output', async (): Promise<void> => {
      const reportData = {
        reportTitle: 'hello',
        pageTitle: 'world',
        styles: 'styling',
      };
      const templates = await getTemplates();
      const handler = createReportHandler(
        expectedTestSuite,
        pathToMockTestDirectory,
        reportData as ReportData,
        templates,
      );
      const result = await getFileContents(pathToMockTestDirectory);
      const expected = '';

      expect(handler(result)).to.equal(expected);
    });
  });
});
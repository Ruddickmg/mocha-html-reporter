import { remove } from 'fs-extra';
import { expect } from 'chai';
import { mkdirSync, writeFileSync } from 'fs';
import {
  getHistory,
  writeHistory,
  nonHistoryError,
  emptyHistoryError,
} from '../../../src/history/storage';
import {
  PATH_SEPARATOR,
  PATH_TO_PACKAGE,
  TEST_DIRECTORY,
} from '../../../src/constants/constants';
import { checkTestTreeEquality } from '../../../src/parsers/testSuite';
import { TestResult } from '../../../src/report/eventHandlers';

describe('history', (): void => {
  const pathToMockHtml = `${PATH_TO_PACKAGE}/${TEST_DIRECTORY}/unit/mockHistory`;
  const firstTest = { title: 'hello world!' } as TestResult;
  const secondTest = { title: 'hello computer!' } as TestResult;
  const thirdTest = { title: 'hello... ?' } as TestResult;
  const testFilePath = `${pathToMockHtml}${PATH_SEPARATOR}testFile.ts`;

  beforeEach((): void => mkdirSync(pathToMockHtml));
  afterEach((): void => remove(pathToMockHtml));

  describe('getHistory', (): void => {
    it('Returns an empty array if no history exists', async (): Promise<void> => {
      expect(await getHistory(testFilePath)).to.eql([]);
    });
    it('will grab file history from a file', async (): Promise<void> => {
      const testResults = [firstTest];
      await writeHistory(testFilePath, testResults);
      checkTestTreeEquality(
        await getHistory(testFilePath) as TestResult[],
        testResults as TestResult[],
      );
    });
  });
  describe('writeHistory', (): void => {
    it('Will write a test result to a file in the specified directory', async (): Promise<void> => {
      const singleTestResult = [firstTest];
      await writeHistory(testFilePath, singleTestResult);
      checkTestTreeEquality(await getHistory(testFilePath), singleTestResult);
    });
    it('Will write multiple test results to a file in a specified directory', async (): Promise<void> => {
      const multipleTestResults = [firstTest, secondTest, thirdTest];
      await writeHistory(testFilePath, multipleTestResults);
      console.log(await getHistory(testFilePath));
      checkTestTreeEquality(await getHistory(testFilePath), multipleTestResults);
    });
    it('Will throw an error when attempting to write an empty history', async (): Promise<void> => {
      const error = emptyHistoryError();
      let errorThrown = false;
      try {
        await writeHistory(testFilePath, []);
      } catch (e) {
        errorThrown = true;
        expect(e.message).to.equal(error);
      }
      if (!errorThrown) {
        throw new Error(`Expected "writeHistory" to throw: ${error}`);
      }
    });
    ['', 1, {}].forEach((variable: any): void => {
      const type = typeof variable;
      it(
        `Will throw an error when attempting to write a value of type ${type} to history`,
        async (): Promise<any> => {
          const error = nonHistoryError(variable);
          let errorThrown = false;
          try {
            await writeHistory(testFilePath, variable);
          } catch (e) {
            errorThrown = true;
            expect(e.message).to.equal(error);
          }
          if (!errorThrown) {
            throw new Error(`Expected "writeHistory" to throw: ${error}`);
          }
        },
      );
    });
  });
});

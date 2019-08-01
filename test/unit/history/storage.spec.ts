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

  const removeMockHtmlDirectory = () => remove(pathToMockHtml);
  beforeEach((): void => mkdirSync(pathToMockHtml));
  afterEach(removeMockHtmlDirectory);

  describe('getHistory', (): void => {
    it('Returns an empty array if no history exists', async (): Promise<void> => {
      expect(await getHistory(pathToMockHtml)).to.eql([]);
    });
    it('will grab file history from a file', async (): Promise<void> => {
      const testResults = [firstTest];
      writeFileSync(
        `${pathToMockHtml}${PATH_SEPARATOR}test.json`,
        JSON.stringify(testResults),
      );
      checkTestTreeEquality(
        await getHistory(pathToMockHtml) as TestResult[],
        testResults as TestResult[],
      );
    });
    it('Will grab and combine multiple history files', async (): Promise<void> => {
      const testResults = [[firstTest], [secondTest], [thirdTest]] as TestResult[][];
      testResults.map((result: TestResult[], index: number): void => writeFileSync(
        `${pathToMockHtml}${PATH_SEPARATOR}${index}.json`,
        JSON.stringify(result),
      ));
      checkTestTreeEquality(
        await getHistory(pathToMockHtml),
        testResults.map((([result]: TestResult[]): TestResult => result)),
      );
    });
  });
  describe('writeHistory', (): void => {
    const testFilePath = `${pathToMockHtml}${PATH_SEPARATOR}testFile.ts`;
    it('Will write a test result to a file in the specified directory', async (): Promise<void> => {
      const singleTestResult = [firstTest];
      await writeHistory(testFilePath, singleTestResult);
      checkTestTreeEquality(await getHistory(pathToMockHtml), singleTestResult);
    });
    it('Will write multiple test results to a file in a specified directory', async (): Promise<void> => {
      const multipleTestResults = [firstTest, secondTest, thirdTest];
      await writeHistory(testFilePath, multipleTestResults);
      checkTestTreeEquality(await getHistory(pathToMockHtml), multipleTestResults);
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

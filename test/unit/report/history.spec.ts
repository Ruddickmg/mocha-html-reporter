import { getHistory } from '../../../src/report/history';
import { mkdirSync, writeFileSync } from "fs";
import {PATH_SEPARATOR, PATH_TO_PACKAGE, TEST_DIRECTORY} from "../../../src/constants";
import {checkTestTreeEquality} from "../../../src/parsers/testSuite";
import {TestResult} from "../../../src/report/eventHandlers";
const { remove } = require('fs-extra');

describe('history', (): void => {
  const pathToMockHtml = `${PATH_TO_PACKAGE}/${TEST_DIRECTORY}/unit/history`;
  beforeEach((): void => mkdirSync(pathToMockHtml));
  afterEach(() => remove(pathToMockHtml));

  describe('getHistory', (): void => {
    const firstTest = { title: 'hello world!' } as TestResult;
    const secondTest = { title: 'hello computer!' } as TestResult;
    const thirdTest = { title: 'hello... ?' } as TestResult;
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
      )
    });
  });
});
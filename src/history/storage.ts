import { readdir } from 'fs';
import {
  getFileContents,
  writeToFile,
} from '../utilities/fileSystem';
import { TestResult } from '../report/eventHandlers';
import { PATH_SEPARATOR } from '../constants/constants';
import { isArray } from '../utilities/typeChecks';

export const emptyHistoryError = (): string => 'Expected an array containing test results while writing to history output, received an empty array';
export const nonHistoryError = (history: any): string => `Expected an array when writing to history output, received ${typeof history}.`;

export const getHistory = (
  pathToHistoryDir: string,
): Promise<TestResult[]> => new Promise((resolve, reject): any => readdir(
  pathToHistoryDir,
  async (error, files): Promise<void> => {
    if (error) {
      reject(error);
    }
    resolve(
      (await Promise.all(files.map(
        (
          fileName: string
        ): Promise<any> => getFileContents(`${pathToHistoryDir}${PATH_SEPARATOR}${fileName}`),
      )))
        .reduce((
          history: TestResult[],
          contents: string,
        ): TestResult[] => [
          ...history,
          ...JSON.parse(contents),
        ], [] as TestResult[])
    );
  },
));

export const writeHistory = (
  pathToHistoryDirectory: string,
  history: TestResult[],
): Promise<void> => {
  if (isArray(history)) {
    if (history.length) {
      return writeToFile(
        `${pathToHistoryDirectory}${PATH_SEPARATOR}${new Date().getMilliseconds()}.json`,
        JSON.stringify(history),
      );
    }
    throw new Error(emptyHistoryError());
  }
  throw new Error(nonHistoryError(history));
};

import {
  existsSync,
  createWriteStream,
  createReadStream,
} from 'fs';
import { stringify, parse } from 'JSONStream';
import { TestResult } from '../report/eventHandlers';
import {
  JSON_EXTENSION,
  PATH_SEPARATOR,
  STREAM_DATA,
  STREAM_FINISH,
  STREAM_ERROR,
  STREAM_END,
} from '../constants/constants';
import { isArray } from '../utilities/typeChecks';
import { getFileNameFromPath } from '../utilities/compiler';
import { removeFileName } from '../parsers/formatting';
import { logError, logMessage } from '../utilities/logging';

export const emptyHistoryError = (): string => 'Expected an array containing test results while writing to history output, received an empty array';
export const nonHistoryError = (history: TestResult[]): string => `Expected an array when writing to history output, received ${typeof history}.`;
export const formatHistoryFilePath = (filePath: string): string => `${removeFileName(filePath)}${PATH_SEPARATOR}${getFileNameFromPath(filePath)}.history${JSON_EXTENSION}`;

export const writeHistoryJsonStream = (
  fileName: string,
  history: TestResult[],
): Promise<void> => new Promise((resolve, reject): void => {
  const writeStream = createWriteStream(fileName);
  const transformStream = stringify('[', ',', ']');
  transformStream.pipe(writeStream);
  history.forEach(transformStream.write);
  transformStream.end();
  writeStream.on(STREAM_FINISH, (): void => {
    logMessage('History has been output to:', fileName);
    resolve();
  });
  writeStream.on(STREAM_ERROR, (error: Error) => {
    logError('Error outputting history to:', fileName, '\n', error);
    reject(error);
  });
});

export const getHistoryJsonStream = (
  fileName: string,
): Promise<TestResult[]> => new Promise((resolve, reject): void => {
  const history: TestResult[] = [];
  const parser = parse('*');
  const readStream = createReadStream(fileName);
  readStream.pipe(parser);
  parser.on(STREAM_DATA, (test: TestResult): number => history.push(test));
  readStream.on(STREAM_END, (): void => resolve(history));
  readStream.on(STREAM_ERROR, (error: Error) => {
    logError('Error importing history from:', fileName, '\n', error);
    reject(error);
  });
});

export const getHistory = (
  fileName: string,
): Promise<TestResult[]> => {
  const historyFileName = formatHistoryFilePath(fileName);
  return existsSync(historyFileName)
    ? getHistoryJsonStream(historyFileName)
    : Promise.resolve([]);
};

export const writeHistory = (
  fileName: string,
  history: TestResult[],
): Promise<void> => {
  if (isArray(history)) {
    if (history.length) {
      return writeHistoryJsonStream(
        formatHistoryFilePath(fileName),
        history,
      );
    }
    throw new Error(emptyHistoryError());
  }
  throw new Error(nonHistoryError(history));
};

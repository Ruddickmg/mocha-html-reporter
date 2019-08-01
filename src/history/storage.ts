import {
  existsSync,
  readdir,
  createWriteStream,
  createReadStream,
} from 'fs';
import { stringify, parse } from 'JSONStream';
import chalk from 'chalk';
import { TestResult } from '../report/eventHandlers';
import {
  JSON_EXTENSION,
  PATH_SEPARATOR, STREAM_DATA,
  STREAM_FINISH,
  STREAM_ERROR,
  STREAM_END,
} from '../constants/constants';
import { isArray } from '../utilities/typeChecks';
import { flattenArray } from '../utilities/arrays';
import {getFileNameFromPath} from "../utilities/compile";
import {removeFileName} from "../parsers/formatting";

export const emptyHistoryError = (): string => 'Expected an array containing test results while writing to history output, received an empty array';
export const nonHistoryError = (history: any): string => `Expected an array when writing to history output, received ${typeof history}.`;

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
    chalk.blueBright(`History has been output to: ${fileName}`);
    resolve();
  });
  writeStream.on(STREAM_ERROR, reject);
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
  readStream.on(STREAM_ERROR, reject);
});

export const getHistory = (
  pathToHistoryDir: string,
): Promise<TestResult[]> => new Promise((resolve, reject): void => {
  if (existsSync(pathToHistoryDir)) {
    readdir(
      pathToHistoryDir,
      async (error, files): Promise<void> => {
        if (error) {
          reject(error);
        }
        resolve(
          flattenArray(
            await Promise.all(
              (files || [])
                .filter((fileName: string): boolean => fileName.includes(JSON_EXTENSION))
                .map((
                  fileName: string,
                ): Promise<TestResult[]> => getHistoryJsonStream(`${pathToHistoryDir}${PATH_SEPARATOR}${fileName}`)),
            ),
          ),
        );
      },
    );
  } else {
    resolve([]);
  }
});

export const writeHistory = (
  fileName: string,
  history: TestResult[],
): Promise<void> => {
  if (isArray(history)) {
    if (history.length) {
      return writeHistoryJsonStream(
        `${removeFileName(fileName)}${PATH_SEPARATOR}${getFileNameFromPath(fileName)}.history.${JSON_EXTENSION}`,
        history,
      );
    }
    throw new Error(emptyHistoryError());
  }
  throw new Error(nonHistoryError(history));
};

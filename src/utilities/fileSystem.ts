import {
  createWriteStream,
  createReadStream,
  existsSync,
  mkdirSync,
  readFile,
} from 'fs';

import { removeFileName } from '../formatting/paths';
import { logError, logMessage } from './logging';
import { getFileNameFromPath } from '../compiler';
import { htmlDataParser } from '../parsers/history';
import { isString } from '../scripts/utilities/typeChecks';
import {
  END_OF_STREAM,
  STREAM_DATA,
  STREAM_ERROR,
  STREAM_FINISH,
} from '../constants/streams';
import { TestResult } from '../scripts/formatting/html';

export const writeToFile = (
  pathToFile: string,
  content: string,
): Promise<void> => new Promise((
  resolve,
  reject,
): void => {
  const pathToDirectory = removeFileName(pathToFile);
  if (!existsSync(pathToDirectory)) {
    mkdirSync(pathToDirectory);
  }
  const writeStream = createWriteStream(pathToFile);
  writeStream.write(content);
  writeStream.on(STREAM_FINISH, (error: Error): void => {
    if (error) {
      logError(error);
      reject(error);
    } else {
      logMessage(getFileNameFromPath(pathToFile), 'has been output to:', pathToFile);
      resolve();
    }
  });
  writeStream.end();
});

export const getFileContents = (
  pathToFile: string,
): Promise<string> => new Promise(
  (resolve, reject): void => readFile(
    pathToFile,
    (
      error: Error,
      data: any,
    ): void => (error
      ? reject(error)
      : resolve(data.toString())),
  ),
);

export const getHistory = (
  filePath: string,
): Promise<TestResult[]> => new Promise((
  resolve,
  reject,
): void => {
  if (existsSync(filePath)) {
    try {
      const parseDataFromHtml = htmlDataParser();
      const readStream = createReadStream(filePath);
      let data: TestResult[] = [];
      readStream.on(STREAM_DATA, (fileContents: Buffer): void => {
        const parsedData = parseDataFromHtml(fileContents.toString());
        if (isString(parsedData)) {
          data = JSON.parse(parsedData as string);
          readStream.destroy();
          resolve(data);
        }
      });
      readStream.on(STREAM_ERROR, reject);
      readStream.on(END_OF_STREAM, (): void => resolve(data));
    } catch (error) {
      reject(error);
    }
  } else {
    resolve([]);
  }
});

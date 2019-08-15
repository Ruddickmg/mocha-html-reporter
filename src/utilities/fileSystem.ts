import {
  createWriteStream,
  createReadStream,
  existsSync,
  mkdirSync,
  readFile,
} from 'fs';
import { removeFileName } from '../formatting/paths';
import { logError, logMessage } from './logging';
import { getFileNameFromPath } from '../scripts/compiler';
import { parseDataFromHtml } from '../parsers/history';
import { isString } from './typeChecks';
import { TestResult } from '../report/eventHandlers';
import {
  END_OF_STREAM,
  STREAM_DATA,
  STREAM_ERROR,
  STREAM_FINISH,
} from '../constants/streams';
import { from } from 'event-stream';
import { EMPTY_STRING } from '../constants/constants';
import { DATA_CLOSING_TAGS, DATA_OPENING_TAGS } from '../constants/html';
import { History } from '../report/eventHandlers';

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

const surroundWithHtmlTags = (data: string): string => `${DATA_OPENING_TAGS}${data}${DATA_CLOSING_TAGS}`;

export const streamingReplaceInFile = (
  fileName: string,
  match: string,
  replacement: string,
): Promise<void> => new Promise((
  resolve,
  reject,
): void => {
  const stream = createReadStream(fileName);
  stream.pipe(
    from(surroundWithHtmlTags(match))
      .to(surroundWithHtmlTags(replacement)),
  );
  stream.on(END_OF_STREAM, resolve);
  stream.on(STREAM_ERROR, reject);
});

export const getHistoryAsJson = (
  filePath: string,
): Promise<string> => new Promise((
  resolve,
  reject,
): void => {
  if (existsSync(filePath)) {
    try {
      const readStream = createReadStream(filePath);
      let data: any = [];
      readStream.on(STREAM_DATA, (fileContents: string): void => {
        const parsedData = parseDataFromHtml(fileContents);
        if (isString(parsedData)) {
          data = parsedData as string;
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
    resolve(EMPTY_STRING);
  }
});

export const getHistory = async (fileName: string): Promise<History> => (
  existsSync(fileName)
    ? JSON.parse(await getHistoryAsJson(fileName))
    : {}
);

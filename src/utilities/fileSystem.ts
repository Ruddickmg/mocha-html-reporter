import {
  createWriteStream,
  createReadStream,
  existsSync,
  mkdirSync,
  readFile,
} from 'fs';
import { EMPTY_STRING, STREAM_ERROR, STREAM_FINISH } from '../constants/constants';
import { removeFileName } from '../parsers/formatting';
import { logError, logMessage } from './logging';
import { getFileNameFromPath } from './compiler';
import { buildParseTree, createParser, parseDataFromHtml } from './parser';
import { DATA } from '../constants/cssClasses';
import { isString } from './typeChecks';

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

export const streamDataFromHtmlOutput = (
  filePath: string,
): Promise<any> => new Promise((
  resolve,
  reject,
) => {
  const readStream = createReadStream(filePath);
  readStream.on('data', (fileContents: string): void => {
    try {
      const data = parseDataFromHtml(fileContents);
      if (isString(data)) {
        resolve(JSON.parse(data));
        readStream.emit('close');
        readStream.emit('end');
      }
    } catch (error) {
      reject(error);
    }
  });
  readStream.on(STREAM_ERROR, reject);
});

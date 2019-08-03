import {
  createWriteStream, existsSync, mkdirSync, readFile,
} from 'fs';
import { STREAM_FINISH } from '../constants/constants';
import { removeFileName } from '../parsers/formatting';
import { logError, logMessage } from './logging';
import { getFileNameFromPath } from './compiler';

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

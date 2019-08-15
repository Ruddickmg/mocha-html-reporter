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
import {
  END_OF_STREAM,
  STREAM_DATA,
  STREAM_ERROR,
  STREAM_FINISH,
} from '../constants/streams';
import { EMPTY_STRING } from '../constants/constants';
import { splitStringIntoChunks } from './strings';

export const writeToFile = (
  pathToFile: string,
  content: string,
): Promise<void> => new Promise((
  resolve,
  reject,
): void => {
  const CHUNK_SIZE = 1000;
  const pathToDirectory = removeFileName(pathToFile);
  if (!existsSync(pathToDirectory)) {
    mkdirSync(pathToDirectory);
  }
  const chunks = splitStringIntoChunks(content, CHUNK_SIZE);
  const amount = chunks.length;
  const writeStream = createWriteStream(pathToFile);
  for (let chunkIndex = 0; chunkIndex < amount; chunkIndex += 1) {
    writeStream.write(chunks[chunkIndex]);
  }
  writeStream.end();
  writeStream.on(STREAM_FINISH, (): void => {
    logMessage(getFileNameFromPath(pathToFile), 'has been output to:', pathToFile);
    resolve();
  });
  writeStream.on(STREAM_ERROR, (error: Error): void => {
    logError(error);
    reject(error);
  });
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

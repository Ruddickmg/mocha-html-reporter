import {
  readFile,
  existsSync,
  mkdirSync,
  createWriteStream,
} from 'fs';
import {
  PATH_TO_PACKAGE,
  PATH_SEPARATOR, STREAM_FINISH,
} from '../constants/constants';
import { removeFileName } from '../parsers/formatting';

export const getPackageName = (): string => PATH_TO_PACKAGE
  .split(PATH_SEPARATOR)
  .pop();

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
  writeStream.on(STREAM_FINISH, (error: Error): void => (
    error
      ? reject(error)
      : resolve()
  ));
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

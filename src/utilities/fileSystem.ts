import {
  readFile,
  writeFile,
  existsSync,
  mkdirSync,
} from 'fs';
import {
  PATH_TO_PACKAGE,
  PATH_SEPARATOR,
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
  return writeFile(
    pathToFile,
    content,
    (
      error: Error,
    ): void => {
      return error
        ? reject(error)
        : resolve()
    });
});

export const getFileContents = (
  pathToFile: string,
): Promise<string> => new Promise(
  (resolve, reject): void => readFile(
    pathToFile,
    (
      error: Error,
      data: Buffer,
    ): void => {
      return error
        ? reject(error)
        : resolve(data.toString());
    }));
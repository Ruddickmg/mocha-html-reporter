import { resolve } from 'path';
import { EMPTY_STRING } from '../constants/punctuation';
import { PATH_SEPARATOR } from '../constants/fileSystem';

export const formatOutputPath = (
  outputDir: string,
): string => `${resolve(process.cwd(), outputDir)}${PATH_SEPARATOR}`;

export const formatOutputFilePath = (
  outputDir: string,
  fileName: string,
): string => `${formatOutputPath(outputDir)}${fileName}.html`;

export const removeFileName = (pathToFile: string): string => {
  const fileName = pathToFile.split(PATH_SEPARATOR).pop();
  const toRemove = `${PATH_SEPARATOR}${fileName}`;
  return pathToFile.replace(toRemove, EMPTY_STRING);
};

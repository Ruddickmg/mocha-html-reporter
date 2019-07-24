import { transformFile } from '@babel/core';
import {
  EMPTY_STRING,
  NEW_LINE,
  PATH_SEPARATOR,
} from '../constants/constants';
import { compose } from "./functions";
import { babelOptions } from "../constants/babelOptions";

export interface Compiled {
  code: string,
  map: any,
  ast: any,
}

interface CodeStore {
  [fileName: string]: string;
}

const SPACE = ' ';
const UNDERSCORE = '_';
const QUOTATION_MARK = '"';
const SEPERATORS = {
  [SPACE]: true,
  [',']: true,
  [')']: true,
  ['(']: true,
  [']']: true,
  ['[']: true,
  [';']: true,
};

export const getImportVariableName = (text: string): string => text
  .split(SPACE)[1]
  .replace(UNDERSCORE, EMPTY_STRING);

export const getTextBetweenMarkers = (
  text: string,
  opening: string,
  closing: string = opening,
): string => text
  .split(opening)[1]
  .split(closing)[0];

export const addTsExtension = (name: string): string => `${name}.ts`;
export const getFileName = (code: string): string => getTextBetweenMarkers(code, QUOTATION_MARK)
  .split(PATH_SEPARATOR)
  .pop();

export const getCode = (
  fileName: string,
): Promise<string> => new Promise((
  resolve,
  reject,
): void => transformFile(
  fileName,
  babelOptions,
  (error: Error, result: Compiled): void => {
    return (
      error
        ? reject(error)
        : resolve(result.code)
    );
  },
));

export const removeFileNameFromPath = (path: string): string => {
  const splitPath = path.split(PATH_SEPARATOR);
  splitPath.pop();
  return splitPath.join(PATH_SEPARATOR);
};

export const getImportLines = (text: string): string[] => text
  .split(NEW_LINE)
  .filter((line: string): boolean => line.includes('require'));

export const getCodeByPath = async (fileName: string): Promise<CodeStore> => {
  const pathToFile = removeFileNameFromPath(fileName);
  const code: string = await getCode(fileName);
  const importLines = getImportLines(code);
  const paths = importLines
    .map(compose(
      getFileName,
      addTsExtension,
      (name: string): string => `${pathToFile}${PATH_SEPARATOR}${name}`,
    ));
  return (await paths
    .reduce(async (
      allCode: Promise<CodeStore>,
      path: string,
    ): Promise<CodeStore> => ({
      ...(await getCodeByPath(path)),
      ...(await allCode),
    }), Promise.resolve({
      [fileName]: code,
    }))) as CodeStore;
};
import { transformFile } from '@babel/core';
import {
  EMPTY_STRING,
  NEW_LINE,
  PATH_SEPARATOR,
} from '../constants/constants';
import {
  compose,
  mapOverObject,
} from "./functions";
import { babelOptions } from "../constants/babelOptions";

export interface Compiled {
  code: string,
  map: any,
  ast: any,
}

interface CodeStore {
  [fileName: string]: string;
}

interface VariableNamesByPath {
  [fileName: string]: string[];
}

const SPACE = ' ';
const UNDERSCORE = '_';
const QUOTATION_MARK = '"';
const SEMICOLON = ';';
const OPENING_CURLY = '{';
const brackets: CodeStore = {
  ['(']: ')',
  ['[']: ']',
  [OPENING_CURLY]: '}',
};

export const getCodeBlock = (
  text: string,
): string => {
  const stack = ['{'];
  const [beginning, end] = text
    .split(OPENING_CURLY);

  if (beginning.includes(SEMICOLON)) {
    const [exportCode] = beginning.split(SEMICOLON);
    return `${exportCode}${SEMICOLON}`;
  }

  return end.reduce((
    output: string,
    char: string,
  ): string => {
    const last = output[output.length - 1];
    const openingBracket = brackets[char];
    const closingBracket = brackets[char];
    if (openingBracket) {
      stack.push(char);
    }
    if (closingBracket === char) {
      stack.pop();
    }
    return last === SEMICOLON && !stack.length
      ? output
      : `${output}${char}`;
  }, beginning);
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

export const mapVariableNamesToImportPaths = (
  files: CodeStore,
): VariableNamesByPath => mapOverObject(
  (code: string): string[] => getImportLines(code)
    .map(getImportVariableName),
  files,
);


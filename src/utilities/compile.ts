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

export interface CodeStore {
  [fileName: string]: string;
}

interface VariableNamesByPath {
  [fileName: string]: string[];
}

const SPACE = ' ';
const UNDERSCORE = '_';
const DOT = '.';
const VARIABLE_DECLARATION = 'var';
const EXPORT_DECLARATION = 'exports';
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
  const [beginning, ...end] = text
    .split(OPENING_CURLY);
  if (beginning.includes(SEMICOLON)) {
    const [exportCode] = beginning.split(SEMICOLON);
    return `${exportCode}${SEMICOLON}`;
  }
  return Array
    .from(end.join(OPENING_CURLY))
    .reduce((
    output: string,
    char: string,
  ): string => {
    const stackSize = stack.length;
    const last = output[output.length - 1];
    const top = stack[stackSize - 1];
    const openingBracket = brackets[char];
    const closingBracket = brackets[top];
    if (openingBracket) {
      stack.push(char);
    }
    if (closingBracket === char) {
      stack.pop();
    }
    return last === SEMICOLON && !stackSize
      ? output
      : `${output}${char}`;
  }, `${beginning}${OPENING_CURLY}`);
};

export const getImportVariableName = (text: string): string => text
  .split(VARIABLE_DECLARATION)[1]
  .split(SPACE)[1];

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

export const getCodeByVariableName = (code: string): CodeStore => {
  let variableName: string;
  return code
    .split(NEW_LINE)
    .reduce((
      all: CodeStore,
      line: string,
      index: number,
      lines: string[],
    ): CodeStore => {
      const comparison = all[variableName] || EMPTY_STRING;
      const code = getCodeBlock(lines.slice(index).join(NEW_LINE));
      if (
        line.includes(VARIABLE_DECLARATION) &&
        !comparison.includes(code)
      ) {
        variableName = getImportVariableName(line);
        return {
          ...all,
          [variableName]: code,
        };
      }
      return all;
    }, {});
};

export const mapFilePathsToImports = (
  files: CodeStore,
): VariableNamesByPath => {
  // TODO
  return {};
};


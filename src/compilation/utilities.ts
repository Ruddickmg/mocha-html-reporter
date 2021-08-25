import { resolve } from 'path';
import {
  FUNCTION_DECLARATION,
  JS_EXTENSION, NEW_LINE,
  OPEN_PARENTHESES,
  PATH_SEPARATOR,
  QUOTATION_MARK,
  SINGLE_QUOTE,
  SPACE,
  VARIABLE_DECLARATION,
} from '../constants';
import { EMPTY_STRING } from '../scripts/constants';
import { isArray } from '../scripts/utilities/typeChecks';
import { getFileContents } from '../utilities/fileSystem';
import { Symbols } from '../parsers/parser';
import { variableNameParser } from '../parsers/variableName';

export const addSpace = (text: string): string => `${text} `;

const variableDeclarations = [
  ...[VARIABLE_DECLARATION, 'const', 'let', FUNCTION_DECLARATION].map(addSpace),
  FUNCTION_DECLARATION,
];

export const addExtension = (name: string): string => `${name}${JS_EXTENSION}`;

export const getTextBetweenMarkers = (
  text: string,
  opening: string[] | string,
  closing: string[] | string = opening,
): string => {
  const openingSymbol = isArray(opening)
    ? (opening as string[]).find(((symbol: string): string => text.split(symbol)[1]))
    : opening as string;
  const closingSymbol: string = isArray(closing)
    ? (closing as string[]).find(((symbol: string): string => text.split(symbol)[0]))
    : closing as string;
  return text
    .split(openingSymbol)[1]
    .split(closingSymbol)[0];
};

export const getFileNameFromRequire = (
  code: string,
): string => getTextBetweenMarkers(code, [QUOTATION_MARK, SINGLE_QUOTE])
  .split(PATH_SEPARATOR)
  .pop();

export const getFilePathFromRequire = (
  root: string,
  code: string,
): string => resolve(root, getTextBetweenMarkers(code, [QUOTATION_MARK, SINGLE_QUOTE]));

export const getFileNameFromPath = (path: string): string => path.split(PATH_SEPARATOR).pop().split('.')[0];
export const charIsNotEmptyString = (codeSection: string): boolean => codeSection !== EMPTY_STRING;

export const getVariableName = (line: string): string => {
  const declaration = variableDeclarations
    .find((declarationType: string): boolean => line.includes(declarationType));
  return line
    .split(declaration)[1]
    .split(SPACE)
    .filter(charIsNotEmptyString)[0]
    .split(OPEN_PARENTHESES)
    .filter(charIsNotEmptyString)[0];
};

export const getCode = async (fileName: string): Promise<string> => getFileContents(fileName);

export const removeFileNameFromPath = (path: string): string => {
  const splitPath = path.split(PATH_SEPARATOR);
  splitPath.pop();
  return splitPath.join(PATH_SEPARATOR);
};

export const getImportLines = (text: string): string[] => text
  .split(NEW_LINE)
  .filter((line: string): boolean => line.includes('require'));

export const terminateTrailingComma = (value: string): string => {
  let isolated = value.trim();
  if (isolated.length && isolated[isolated.length - 1] === ',') {
    isolated = `${isolated.slice(0, -1)};`;
  }
  return isolated;
};

export const getFilePath = (pathToFile: string, code: string): string => addExtension(
  getFilePathFromRequire(pathToFile, code),
);

export const replaceVariablesInBulk = (variableReplacements: Symbols, code: string): string => {
  const { length } = code;
  const parseVariableNames = variableNameParser(variableReplacements);
  let result = EMPTY_STRING;
  let char: string;
  let potentialCode = EMPTY_STRING;
  let match: string | boolean;
  for (let c = 0; c < length; c += 1) {
    char = code[c];
    match = parseVariableNames(char);
    if (match) {
      if (match === true) {
        potentialCode += char;
      } else if (result[result.length - 1] !== '.') {
        result += match;
        potentialCode = EMPTY_STRING;
      } else {
        result += `${potentialCode}${char}`;
        potentialCode = EMPTY_STRING;
      }
    } else {
      result += `${potentialCode}${char}`;
      potentialCode = EMPTY_STRING;
    }
  }
  return result;
};

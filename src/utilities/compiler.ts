import {
  EMPTY_STRING,
  FUNCTION_DECLARATION,
  IMPORT_DECLARATION,
  NEW_LINE,
  OPEN_PARENTHESES,
  PATH_SEPARATOR,
  QUOTATION_MARK,
  SINGLE_QUOTE,
  SPACE,
  VARIABLE_DECLARATION,
} from '../constants/constants';
import { compose, mapOverObject } from './functions';
import { escapedRegEx } from './regEx';
import { getFileContents } from './fileSystem';
import { isArray } from './typeChecks';
import {
  parseCodeBlock,
  parseVariableName,
  Symbols,
  variableDeclarationParser,
  variableNameParser,
} from './parser';

export interface FilesToIgnore {
  [fileName: string]: boolean;
}

export interface CodeStore {
  [identifier: string]: string;
}

export interface FileCodeMappings {
  [filename: string]: CodeStore;
}

const EXTENSION = '.js';

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

export const addExtension = (name: string): string => `${name}${EXTENSION}`;
export const getFileNameFromRequire = (
  code: string,
): string => getTextBetweenMarkers(code, [QUOTATION_MARK, SINGLE_QUOTE])
  .split(PATH_SEPARATOR)
  .pop();

export const getFileNameFromPath = (path: string): string => path.split(PATH_SEPARATOR).pop().split('.')[0];
export const charIsNotEmptyString = (codeSection: string): boolean => codeSection !== EMPTY_STRING;

const addSpace = (text: string): string => `${text} `;
const variableDeclarations = [
  ...[VARIABLE_DECLARATION, 'const', 'let', FUNCTION_DECLARATION].map(addSpace),
  FUNCTION_DECLARATION,
];

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

export const getCode = (fileName: string): Promise<string> => getFileContents(fileName);

export const removeFileNameFromPath = (path: string): string => {
  const splitPath = path.split(PATH_SEPARATOR);
  splitPath.pop();
  return splitPath.join(PATH_SEPARATOR);
};

export const getImportLines = (text: string): string[] => text
  .split(NEW_LINE)
  .filter((line: string): boolean => line.includes('require'));

export const getCodeByPath = async (file: string): Promise<CodeStore> => {
  const seenFiles: FilesToIgnore = {};
  const getFileToCodeMappings = async (fileName: string): Promise<CodeStore> => {
    const code = await getFileContents(fileName);
    const pathToFile = removeFileNameFromPath(fileName);
    const importLines = getImportLines(code);
    const paths = importLines
      .map(compose(
        getFileNameFromRequire,
        addExtension,
        (name: string): string => `${pathToFile}${PATH_SEPARATOR}${name}`,
      ))
      .filter(((path: string): boolean => {
        const notSeenYet = !seenFiles[path];
        seenFiles[path] = true;
        return notSeenYet;
      }));
    seenFiles[fileName] = true;
    return (await paths
      .reduce(async (
        allCode: Promise<CodeStore>,
        path: string,
      ): Promise<CodeStore> => ({
        ...await getFileToCodeMappings(path),
        ...await allCode,
      }), Promise.resolve({
        [fileName]: code,
      }))) as CodeStore;
  };
  return getFileToCodeMappings(file);
};

export const mapCodeBlocksToVariableNames = (code: string): CodeStore => {
  const { length } = code;
  const store: CodeStore = {};
  let char: string;
  let foundDeclaration: string | boolean;
  let declaration: string | boolean = false;
  let variableName: string | boolean;
  let parsedCode: string;
  for (let c = 0; c < length; c += 1) {
    char = code[c];
    foundDeclaration = variableDeclarationParser(char);
    if (foundDeclaration && foundDeclaration !== true && !declaration) {
      declaration = foundDeclaration as string;
    }
    if (declaration) {
      parsedCode = parseCodeBlock(char) as string;
      variableName = (variableName || parseVariableName(char)) as string;
      if (parsedCode) {
        if (!parsedCode.includes(IMPORT_DECLARATION)) {
          store[variableName as string] = `${declaration}${parsedCode}`;
        }
        declaration = false;
        variableName = false;
      }
    }
  }
  return store;
};

export const removeDuplicateCodeBlocks = (
  codeObject: CodeStore,
  codeBlocks: string,
): string => Object
  .keys(codeObject)
  .reduce((code: string, variableName: string): string => {
    const value = codeObject[variableName];
    const [beginning, ...end] = code.split(value);
    return [
      beginning,
      value,
      end
        .join(EMPTY_STRING)
        .replace(escapedRegEx(value), EMPTY_STRING),
    ].join(EMPTY_STRING);
  }, codeBlocks);

export const mapFilePathsToCodeBlocksByVariableName = (
  codeByFilePath: CodeStore,
): FileCodeMappings => mapOverObject(
  mapCodeBlocksToVariableNames,
  codeByFilePath,
);

export const replaceVariablesInCode = (
  variableName: string | string[],
  replacement: string,
  code: string,
): string => {
  const searchPattern = isArray(variableName) ? `(${(variableName as string[]).join('|')})` : variableName;
  return code
    .replace(new RegExp(`(?<=\\W(?=([^"]*"[^"]*")*[^"]*$)(?=([^']*'[^']*')*[^']*$))${searchPattern}(?=\\W)`, 'g'), replacement);
};

export const replaceVariablesInBulk = (variableReplacements: Symbols, code: string): string => {
  const { length } = code;
  const parseVariableNames = variableNameParser(variableReplacements);
  let result = EMPTY_STRING;
  let char: string;
  let potentialCode = EMPTY_STRING;
  let match: string | boolean;
  let firstChar: string;
  for (let c = 0; c < length; c += 1) {
    char = code[c];
    match = parseVariableNames(char);
    if (match) {
      if (match === true) {
        potentialCode += char;
      } else {
        // eslint-disable-next-line prefer-destructuring
        firstChar = potentialCode[0];
        result += `${match[0] === firstChar ? '' : firstChar}${match}`;
        potentialCode = EMPTY_STRING;
      }
    } else {
      result += `${potentialCode}${char}`;
      potentialCode = EMPTY_STRING;
    }
  }
  return result;
};

export const combineVariablesForEachFile = (
  variablesForEachFile: FileCodeMappings,
): CodeStore => Object.keys(variablesForEachFile)
  .reduce((variableNameMappings: CodeStore, filePath: string): CodeStore => {
    const fileNamePrefix = `_${getFileNameFromPath(filePath)}`;
    const codeByVariableName = variablesForEachFile[filePath];
    return Object.keys(codeByVariableName)
      .reduce((uniqueNames: CodeStore, variableName: string): CodeStore => {
        const uniqueName = `${fileNamePrefix}.${variableName}`;
        return {
          ...uniqueNames,
          [variableName.includes('.') ? variableName : uniqueName]: replaceVariablesInBulk(
            { [variableName]: uniqueName },
            codeByVariableName[variableName],
          ),
        };
      }, variableNameMappings);
  }, {});

export type NameGenerator = (...args: any[]) => string;
export type VariableNameGenerator = (code: string, variableNames: string[]) => string;

export const renameAllVariables = (
  generateName: NameGenerator,
): VariableNameGenerator => (
  code: string,
  variableNames: string[],
): string => variableNames
  .reduce((
    codeWithRenamedVariables: string,
    variableName: string,
  ): string => replaceVariablesInCode(
    variableName,
    generateName(),
    codeWithRenamedVariables,
  ), code);

export const combineCodeFromFilesIntoSingleString = (codeObject: CodeStore): string => {
  const variableNames: string[] = Object.keys(codeObject).sort();
  const codeWithoutDependencies: string[] = [];
  const codeWithDependencies = variableNames
    .reduce((
      codeBlocks: string[],
      variable: string,
    ): string[] => {
      const code = codeObject[variable];
      const dependants = variableNames
        .reduce((all: string[], dependency: string): string[] => (
          dependency !== variable && code.includes(dependency)
            ? [...all, codeObject[dependency]]
            : all
        ), []);
      if (!dependants.length) {
        codeWithoutDependencies.push(code);
      }
      return [
        ...codeBlocks,
        ...dependants,
      ];
    }, []);
  return removeDuplicateCodeBlocks(codeObject, [
    ...codeWithoutDependencies,
    ...codeWithDependencies,
  ].join(EMPTY_STRING));
};

export const compileCode = async (
  fileName: string,
  generateName: NameGenerator,
): Promise<string> => {
  const codeByPath = await getCodeByPath(fileName);
  const pathsToCodeByVariableName = mapFilePathsToCodeBlocksByVariableName(codeByPath);
  const codeByVariables = combineVariablesForEachFile(pathsToCodeByVariableName);
  const code = combineCodeFromFilesIntoSingleString(codeByVariables);
  return replaceVariablesInBulk(
    Object.keys(codeByVariables).reduce((names: CodeStore, name: string): CodeStore => ({
      ...names,
      [name]: generateName(),
    }), {}),
    code,
  );
};

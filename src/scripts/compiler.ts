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
import { compose } from '../utilities/functions';
import { escapedRegEx } from '../utilities/regEx';
import { getFileContents } from '../utilities/fileSystem';
import { isArray } from '../utilities/typeChecks';
import { variableDeclarationParser } from '../parsers/variableDeclaration';
import { variableNameParser, parseVariableName } from '../parsers/variableName';
import { parseCodeBlock } from '../parsers/code';
import { Symbols } from '../parsers/parser';

export interface FilesToIgnore {
  [fileName: string]: boolean;
}

export interface CodeStore {
  [identifier: string]: string;
}

export interface FileCodeMappings {
  [filename: string]: CodeStore;
}

export type NameGenerator = (...args: any[]) => string;

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

export const getNameWithExtensionFromFile = compose(
  getFileNameFromRequire,
  addExtension,
);

export const getCodeByPath = async (file: string): Promise<CodeStore> => {
  const importedPaths: FilesToIgnore = {};
  const getFileToCodeMappings = async (fileName: string): Promise<CodeStore> => {
    const code = await getFileContents(fileName);
    const pathToFile = removeFileNameFromPath(fileName);
    const paths = [];
    const lines = code.split(NEW_LINE);
    let lineIndex = lines.length;
    importedPaths[fileName] = true;
    // eslint-disable-next-line no-plusplus
    while (lineIndex--) {
      const line = lines[lineIndex];
      if (line.includes(IMPORT_DECLARATION)) {
        const path = `${pathToFile}${PATH_SEPARATOR}${getNameWithExtensionFromFile(line)}`;
        if (!importedPaths[path]) {
          importedPaths[path] = true;
          paths.push(path);
        }
      }
    }
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
        if (!/require/.test(parsedCode)) {
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
): FileCodeMappings => {
  const paths = Object.keys(codeByFilePath);
  const pathsMappedToCode: FileCodeMappings = {};
  let pathIndex = paths.length;
  // eslint-disable-next-line no-plusplus
  while (pathIndex--) {
    const path = paths[pathIndex];
    pathsMappedToCode[path] = mapCodeBlocksToVariableNames(codeByFilePath[path]);
  }
  return pathsMappedToCode;
};

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
  for (let c = 0; c < length; c += 1) {
    char = code[c];
    match = parseVariableNames(char);
    if (match) {
      if (match === true) {
        potentialCode += char;
      } else {
        result += match;
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
): CodeStore => {
  const codeToVariableMappings: CodeStore = {};
  const filePaths = Object.keys(variablesForEachFile);
  let fileIndex = filePaths.length;
  // eslint-disable-next-line no-plusplus
  while (fileIndex--) {
    const replacementMappings: CodeStore = {};
    const filePath = filePaths[fileIndex];
    const fileNamePrefix = `_${getFileNameFromPath(filePath)}`;
    const codeByVariableName = variablesForEachFile[filePath];
    const variableNames = Object.keys(codeByVariableName);
    const variableNameLength = variableNames.length;
    let variableIndex = variableNameLength;
    // eslint-disable-next-line no-plusplus
    while (variableIndex--) {
      const variableName = variableNames[variableIndex];
      let uniqueName = variableName;
      if (variableName.split('.')[0] === variableName) {
        uniqueName = `${fileNamePrefix}.${variableName}`;
        replacementMappings[variableName] = uniqueName;
      }
    }
    variableIndex = variableNameLength;
    // eslint-disable-next-line no-plusplus
    while (variableIndex--) {
      const variableName = variableNames[variableIndex];
      codeToVariableMappings[replacementMappings[variableName]] = replaceVariablesInBulk(
        replacementMappings,
        codeByVariableName[variableName],
      );
    }
  }
  return codeToVariableMappings;
};

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
  const variableReplacements = Object
    .keys(codeByVariables).reduce((names: CodeStore, name: string): CodeStore => ({
      ...names,
      [name]: generateName(),
    }), {});
  return replaceVariablesInBulk(
    variableReplacements,
    code,
  );
};

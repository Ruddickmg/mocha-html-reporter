import {
  EMPTY_STRING,
  FUNCTION_DECLARATION,
  IMPORT_DECLARATION,
  NEW_LINE,
  OPEN_PARENTHESES,
  OPENING_CURLY,
  PATH_SEPARATOR,
  QUOTATION_MARK,
  SEMICOLON, SINGLE_QUOTE,
  SPACE,
  VARIABLE_DECLARATION,
} from '../constants/constants';
import {
  compose,
  mapOverObject,
} from './functions';
import { escapedRegEx } from './regEx';
import { getFileContents } from './fileSystem';
import { isArray } from './typeChecks';
import { millisecondsToHumanReadable } from '../parsers/formatting';

export interface Compiled {
  code: string;
}

export interface CodeStore {
  [identifier: string]: string;
}

export interface FileCodeMappings {
  [filename: string]: CodeStore;
}

const brackets: CodeStore = {
  [OPENING_CURLY]: '}',
};
const EXTENSION = '.js';

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

export const getCode = (
  fileName: string,
): Promise<string> => getFileContents(fileName);

export const removeFileNameFromPath = (path: string): string => {
  const splitPath = path.split(PATH_SEPARATOR);
  splitPath.pop();
  return splitPath.join(PATH_SEPARATOR);
};

export const getImportLines = (text: string): string[] => text
  .split(NEW_LINE)
  .filter((line: string): boolean => line.includes('require'));

export interface FilesToIgnore {
  [fileName: string]: boolean;
}

export const getCodeByPath = async (file: string): Promise<CodeStore> => {
  const seenFiles: FilesToIgnore = {};
  const getFileToCodeMappings = async (fileName: string): Promise<CodeStore> => {
    const code = await getCode(fileName);
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
      const codeBlock = getCodeBlock(lines.slice(index).join(NEW_LINE));
      if (
        !!variableDeclarations.find((declaration: string): boolean => line.includes(declaration))
        && !comparison.includes(codeBlock)
        && !line.includes(IMPORT_DECLARATION)
      ) {
        variableName = getVariableName(line);
        return {
          ...all,
          [variableName]: codeBlock,
        };
      }
      return all;
    }, {});
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
  variableName: string,
  replacement: string,
  code: string,
): string => code
  .replace(new RegExp(`(?<=\\W(?=([^"]*"[^"]*")*[^"]*$)(?=([^']*'[^']*')*[^']*$))${variableName}(?=\\W)`, 'g'), replacement);

export const combineVariablesForEachFile = (
  variablesForEachFile: FileCodeMappings,
): CodeStore => Object.keys(variablesForEachFile)
  .reduce((variableNameMappings: CodeStore, filePath: string): CodeStore => {
    const fileNamePrefix = `_${getFileNameFromPath(filePath)}`;
    const codeByVariableName = variablesForEachFile[filePath];
    return Object.keys(codeByVariableName)
      .reduce((fileCodeByVariableName: CodeStore, variableName: string): CodeStore => {
        const replacementVariableName = `${fileNamePrefix}.${variableName}`;
        const codeWithVariablesReplaced = !variableName.includes('.')
          ? mapOverObject((
            code: string,
          ): string => replaceVariablesInCode(
            variableName,
            replacementVariableName,
            code,
          ), codeByVariableName)
          : codeByVariableName;
        return {
          ...fileCodeByVariableName,
          [replacementVariableName]: codeWithVariablesReplaced[variableName],
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
        .filter((dependency: string): boolean => dependency !== variable
          && code.includes(dependency))
        .map((dependency: string): string => codeObject[dependency]);
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
): Promise<string> => {
  let start = Date.now();
  const codeByPath = await getCodeByPath(fileName);
  console.log('got results in', millisecondsToHumanReadable(Date.now() - start));
  start = Date.now();
  const codeByVariableName = mapFilePathsToCodeBlocksByVariableName(codeByPath);
  console.log('mapped to variable names in', millisecondsToHumanReadable(Date.now() - start));
  start = Date.now();
  const codeByVariables = combineVariablesForEachFile(codeByVariableName);
  console.log('combined variables in', millisecondsToHumanReadable(Date.now() - start));
  start = Date.now();
  const code = combineCodeFromFilesIntoSingleString(codeByVariables);
  console.log('finished compiling in', millisecondsToHumanReadable(Date.now() - start));
  return code;
};

import { EMPTY_STRING } from '../scripts/constants';
import {
  getFileNameFromPath,
  replaceVariablesInBulk,
  terminateTrailingComma,
} from './utilities';
import { mapFilePathsToCodeBlocksByVariableName } from './formatting';
import { getCodeByPath } from './fileSystem';
import { sortCodeInTopologicalOrder } from './sorting';

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
      const [fileName] = variableName.split('.');
      let uniqueName = variableName;
      if (fileName === variableName) {
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
        terminateTrailingComma(codeByVariableName[variableName]),
      );
    }
  }
  return codeToVariableMappings;
};

export const compileCode = async (
  fileName: string,
  generateName: NameGenerator,
  root?: string,
): Promise<string> => {
  const codeByPath = await getCodeByPath(fileName);
  const pathsToCodeByVariableName = mapFilePathsToCodeBlocksByVariableName(codeByPath);
  const codeByVariables = combineVariablesForEachFile(pathsToCodeByVariableName);
  const sortedCode = sortCodeInTopologicalOrder(codeByVariables, root);
  const code = sortedCode.reverse().join(EMPTY_STRING);
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

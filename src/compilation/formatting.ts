import { variableDeclarationParser } from '../parsers/variableDeclaration';
import { parseCodeBlock } from '../parsers/code';
import { parseVariableName } from '../parsers/variableName';
import { CodeStore, FileCodeMappings } from './index';

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

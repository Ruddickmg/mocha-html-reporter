import { variableDeclarationParser } from '../parsers/variableDeclaration';
import { parseFunctionCodeBlock, parseImmediatelyInvokedFunctionCodeBlock } from '../parsers/code';
import { parseVariableName } from '../parsers/variableName';
import { CodeStore, FileCodeMappings, NameGenerator } from './index';

export const mapCodeBlocksToVariableNames = (
  code: string,
  generateName: NameGenerator,
): CodeStore => {
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
    const immediatelyInvokedFunction = parseImmediatelyInvokedFunctionCodeBlock(char);
    if (immediatelyInvokedFunction) {
      store[generateName()] = immediatelyInvokedFunction as string;
    }
    if (foundDeclaration && foundDeclaration !== true && !declaration) {
      declaration = foundDeclaration as string;
    }
    if (declaration) {
      parsedCode = parseFunctionCodeBlock(char) as string;
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
  nameGenerator: NameGenerator,
): FileCodeMappings => {
  const paths = Object.keys(codeByFilePath);
  const pathsMappedToCode: FileCodeMappings = {};
  let pathIndex = paths.length;
  // eslint-disable-next-line no-plusplus
  while (pathIndex--) {
    const path = paths[pathIndex];
    pathsMappedToCode[path] = mapCodeBlocksToVariableNames(codeByFilePath[path], nameGenerator);
  }
  return pathsMappedToCode;
};

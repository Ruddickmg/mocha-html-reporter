import { CodeStore } from '../formatting/scriptCompiler';
import { buildParseTree, createParser, Symbols } from './parser';
import { NEW_LINE } from '../constants/fileSystem';
import { SPACE } from '../constants/punctuation';

const VARIABLE_DECLARATION = 'var';
const CONST_DECLARATION = 'const';
const FUNCTION_DECLARATION = 'function';
const LET_DECLARATION = 'let';

const variableDeclarations = [
  VARIABLE_DECLARATION,
  CONST_DECLARATION,
  FUNCTION_DECLARATION,
  LET_DECLARATION,
].reduce((symbols: Symbols, declaration: string): Symbols => ({
  ...symbols,
  [`${declaration} `]: declaration,
  [`\n${declaration} `]: declaration,
  [`\r\n${declaration} `]: declaration,
  [`${declaration} `]: declaration,
  [`${declaration};`]: declaration,
}), {});

const allowedDeclarationPrefixes = [SPACE, ';', NEW_LINE]
  .reduce((
    prefixes: CodeStore,
    prefix: string,
  ): CodeStore => ({
    ...prefixes,
    [prefix]: prefix,
  }), {});

export const variableDeclarationSymbols = buildParseTree(variableDeclarations);
export const variableDeclarationParser = createParser(
  variableDeclarationSymbols,
  allowedDeclarationPrefixes,
);

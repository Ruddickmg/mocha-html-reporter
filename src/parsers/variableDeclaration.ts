import { CodeStore } from '../scripts/compiler';
import { buildParseTree, createParser, Symbols } from './parser';

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

const allowedDeclarationPrefixes = [' ', ';', '\n']
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

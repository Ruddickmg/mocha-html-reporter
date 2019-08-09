import { EMPTY_STRING } from '../constants/constants';
import { isString } from '../utilities/typeChecks';
import { CodeStore } from '../scripts/compiler';

export interface Symbols {
  [symbolName: string]: string;
}

export interface ParseTree {
  [symbol: string]: ParseTree | string;
}

export type Parser = (char: string) => string | boolean;

export const buildParseTree = (symbols: Symbols): ParseTree => {
  const parseTree: ParseTree = {};
  const symbolNames = Object.keys(symbols);
  let nameIndex = symbolNames.length;
  // eslint-disable-next-line no-plusplus
  while (nameIndex--) {
    const symbolName = symbolNames[nameIndex];
    const symbolChars = symbolName.split(EMPTY_STRING);
    const stringLength = symbolChars.length - 1;
    const lastChar = symbolChars[stringLength];
    let parserStore = parseTree;
    for (let charIndex = 0; charIndex < stringLength; charIndex += 1) {
      const char = symbolChars[charIndex];
      const pathValue = parserStore[char] || {};
      if (isString(pathValue)) {
        throw new Error(`Error in buildParseTree, Symbol: "${pathValue}" is attempting to be overwritten by: "${symbolName}", only unique symbols are allowed.`);
      }
      parserStore[char] = pathValue as ParseTree;
      parserStore = pathValue as ParseTree;
    }
    if (parserStore[lastChar]) {
      throw new Error(`Error in buildParseTree, Symbol: "${parserStore[lastChar]}" is attempting to be overwritten by: "${symbolName}", only unique symbols are allowed.`);
    }
    parserStore[lastChar] = symbols[symbolName];
  }
  return parseTree;
};

export const createParser = (parseTree: ParseTree, allowedPrefixes?: CodeStore): Parser => {
  let symbol: ParseTree = parseTree;
  let previousChar: string;
  return (char: string): boolean | string => {
    const noMatchYetMade = symbol === parseTree;
    const prefixNotAllowed = allowedPrefixes
      && previousChar
      && noMatchYetMade
      && !allowedPrefixes[previousChar];
    previousChar = char;
    symbol = (symbol[char] || parseTree[char]) as ParseTree;
    if (!symbol || prefixNotAllowed) {
      symbol = parseTree;
      return false;
    }
    return isString(symbol)
      ? symbol as unknown as string
      : true;
  };
};

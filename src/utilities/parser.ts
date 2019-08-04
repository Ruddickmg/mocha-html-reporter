import { CLOSING_CURLY, EMPTY_STRING, OPENING_CURLY } from '../constants/constants';
import { isNumeric, isString } from './typeChecks';
import { CodeStore } from './compiler';
import all from '../templates/all';

export interface Symbols {
  [symbolName: string]: string;
}

export interface ParseTree {
  [symbol: string]: ParseTree | string;
}

interface EndSymbol {
  [symbol: string]: boolean;
}

export type Parser = (char: string) => string | boolean;

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
    const prefixNotAllowed = allowedPrefixes
      && previousChar
      && !allowedPrefixes[previousChar];
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

export const variableDeclarationSymbols = buildParseTree(variableDeclarations);
export const variableDeclarationParser = createParser(variableDeclarationSymbols, { ' ': '  ' });

const endSymbol: EndSymbol = {
  ';': true,
  '\n': true,
  '\r': true,
  '\n\r': true,
  '\r\n': true,
};

export const isAllowedInVariableName = (value: string): boolean => /^[a-z0-9|_|.]+$/i.test(value);

export const parseVariableName = ((): Parser => {
  let variableName = EMPTY_STRING;
  let started = false;
  return (char: string): string | boolean => {
    if (isAllowedInVariableName(char)) {
      variableName += char;
      started = true;
      return false;
    }
    const result = started
      && !!variableName.length
      && !isNumeric(variableName)
      && variableName;
    if (result) {
      started = false;
      variableName = EMPTY_STRING;
    }
    return result;
  };
})();

export const parseCodeBlock = ((): Parser => {
  let brackets = 0;
  let seen = EMPTY_STRING;
  let started = false;
  let result: string;
  return (
    char: string,
    initialString: string = EMPTY_STRING,
  ): string => {
    if (seen === EMPTY_STRING) {
      seen = initialString;
    }
    seen += char;
    if (char === OPENING_CURLY) {
      brackets += 1;
      started = true;
    }
    if (char === CLOSING_CURLY) {
      brackets -= 1;
    }
    const finished = !!(
      !(brackets && started) && (
        endSymbol[char]
        || endSymbol[seen.slice(-2)]
        || endSymbol[seen.slice(-4)]
      )
    );
    if (finished) {
      result = seen;
      seen = EMPTY_STRING;
      started = false;
    }
    return finished && result;
  };
})();

const allowedVariableNamePrefixes = ['(', '[', ',', ' ']
  .reduce((
    prefixes: CodeStore,
    prefix: string,
  ): CodeStore => ({
    ...prefixes,
    [prefix]: prefix,
  }), {});
const allowedVariableNameSuffixes = [')', ']', '.', ';', ',', ' ', '(', '['];
const suffixesLength = allowedVariableNameSuffixes.length;

export const variableNameParser = (namesAndReplacements: Symbols): Parser => {
  const variablesMappedToReplacements: CodeStore = {};
  const variableNames = Object.keys(namesAndReplacements);
  let nameIndex = variableNames.length;
  // eslint-disable-next-line no-plusplus
  while (nameIndex--) {
    const variableName = variableNames[nameIndex];
    const replacement = namesAndReplacements[variableName];
    let suffixIndex = suffixesLength;
    // eslint-disable-next-line no-plusplus
    while (suffixIndex--) {
      const suffix = allowedVariableNameSuffixes[suffixIndex];
      variablesMappedToReplacements[`${variableName}${suffix}`] = `${replacement}${suffix}`;
    }
  }
  return createParser(buildParseTree(variablesMappedToReplacements), allowedVariableNamePrefixes);
};

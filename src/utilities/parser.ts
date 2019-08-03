import { CLOSING_CURLY, EMPTY_STRING, OPENING_CURLY } from '../constants/constants';
import { isNumeric, isString } from './typeChecks';

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
  [` ${declaration} `]: declaration,
  [`${declaration};`]: declaration,
}), {});

export const buildParseTree = (symbols: Symbols): ParseTree => {
  const parseTree: ParseTree = {};
  Object
    .keys(symbols)
    .forEach((symbolName: string): void => {
      const symbolChars = symbolName.split(EMPTY_STRING);
      const lastChar = symbolChars.pop();
      const lastObject = symbolChars
        .reduce((parserStore: ParseTree, char: string): ParseTree => {
          const pathValue = parserStore[char];
          if (isString(pathValue)) {
            throw new Error(`Symbol: ${pathValue} is attempting to be overwritten by: ${symbolName}, only unique symbols are allowed.`);
          }
          // eslint-disable-next-line no-param-reassign
          parserStore[char] = pathValue || {} as ParseTree;
          return parserStore[char] as ParseTree;
        }, parseTree);
      lastObject[lastChar] = symbols[symbolName];
    });
  return parseTree;
};

export const variableDeclarationSymbols = buildParseTree(variableDeclarations);

export const createParser = (parseTree: ParseTree): Parser => {
  let symbol: ParseTree = parseTree;
  return (char: string): boolean | string => {
    symbol = (symbol[char] || parseTree[char]) as ParseTree;
    if (!symbol) {
      symbol = parseTree;
      return false;
    }
    return isString(symbol) ? symbol as unknown as string : !!symbol;
  };
};

export const variableDeclarationParser = createParser(variableDeclarationSymbols);

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

export const variableNameParser = (namesAndReplacements: Symbols): Parser => {
  const variableKeys = Object.keys(namesAndReplacements)
    .reduce((symbols: Symbols, declaration: string): Symbols => ({
      ...['(', ')', '[', ']', ',']
        .reduce((all: Symbols, delimiter: string): Symbols => ({
          ...all,
          [`${delimiter}${declaration} `]: `${delimiter}${namesAndReplacements[declaration]} `,
          [` ${declaration}${delimiter}`]: `${namesAndReplacements[declaration]}${delimiter}`,
          [`${delimiter}${declaration}${delimiter}`]: `${delimiter}${namesAndReplacements[declaration]}${delimiter}`,
          [`${delimiter}${declaration}.`]: `${delimiter}${namesAndReplacements[declaration]}.`,
          [`${delimiter}${declaration};`]: `${delimiter}${namesAndReplacements[declaration]};`,
          [`${delimiter}${declaration},`]: `${delimiter}${namesAndReplacements[declaration]},`,
        }), symbols),
      [`(${declaration})`]: `(${namesAndReplacements[declaration]})`,
      [` ${declaration} `]: ` ${namesAndReplacements[declaration]} `,
      [`[${declaration}]`]: `[${namesAndReplacements[declaration]}]`,
      [` ${declaration}.`]: ` ${namesAndReplacements[declaration]}.`,
      [` ${declaration};`]: ` ${namesAndReplacements[declaration]};`,
      [` ${declaration},`]: ` ${namesAndReplacements[declaration]},`,
    }), {});
  return createParser(buildParseTree(variableKeys));
};

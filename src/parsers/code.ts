import {
  CLOSE_PARENTHESES, CLOSING_CURLY, OPEN_PARENTHESES, OPENING_CURLY,
} from '../constants';
import { Parser } from './parser';
import { EMPTY_STRING } from '../scripts/constants';

interface EndSymbol {
  [symbol: string]: boolean;
}

const endSymbol: EndSymbol = {
  ';': true,
  '\n': true,
  '\r\n': true,
};

export const immediatelyInvokedFunction = new RegExp(/\(function\s*\(.*\)\s*{\s.*}\)\(.*\)/, 'ms');
export const exportsRegex = new RegExp(/exports\..*?\s=\s/);

export const parseFunctionCodeBlock = ((): Parser => {
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
    const finished = !!(!(brackets && started) && endSymbol[char]);
    if (finished) {
      result = seen;
      seen = EMPTY_STRING;
      started = false;
    }
    return finished && result;
  };
})();

export const parseImmediatelyInvokedFunctionCodeBlock = ((): Parser => {
  let brackets = 0;
  let seen = EMPTY_STRING;
  let started = false;
  let result: string;
  return (char: string, initialString: string = EMPTY_STRING): string => {
    if (seen === EMPTY_STRING) {
      seen = initialString;
    }
    seen += char;
    if (char === OPEN_PARENTHESES) {
      brackets += 1;
      if (!started) {
        seen = char;
        started = true;
      }
    }
    if (char === CLOSE_PARENTHESES) {
      brackets -= 1;
    }
    if (!(brackets && started) && endSymbol[char]) {
      result = seen;
      seen = EMPTY_STRING;
      started = false;
      if (result.includes('function') && immediatelyInvokedFunction.test(result)) {
        return result.replace(exportsRegex, '');
      }
    }
  };
})();

export const parseCodeBlock = (() => (char: string) => {
  const func = parseFunctionCodeBlock(char);
  const enm = parseImmediatelyInvokedFunctionCodeBlock(char);
  return func || enm;
})();

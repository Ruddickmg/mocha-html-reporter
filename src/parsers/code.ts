import { CLOSING_CURLY, OPENING_CURLY } from '../constants/index';
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
    const finished = !!(!(brackets && started) && endSymbol[char]);
    if (finished) {
      result = seen;
      seen = EMPTY_STRING;
      started = false;
    }
    return finished && result;
  };
})();

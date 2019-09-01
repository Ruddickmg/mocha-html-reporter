import {
  CLOSING_CURLY,
  EMPTY_STRING,
  ESCAPE_STRING,
  OPENING_CURLY,
} from '../constants/punctuation';
import { Parser } from '../types/parsers';

interface EndSymbol {
  [symbol: string]: boolean;
}

interface Quotes {
  [symbol: string]: string;
}

const endSymbol: EndSymbol = {
  ';': true,
  '\n': true,
};

const quotes: Quotes = {
  '"': '"',
  '\'': '\'',
};

export const parseCodeBlock = ((): Parser => {
  let brackets = 0;
  let seen = EMPTY_STRING;
  let started = false;
  let quoted: string | boolean = false;
  let escape = false;
  return (
    char: string,
    initialString: string = EMPTY_STRING,
  ): string => {
    let result: string;
    if (quoted ? !escape && char === quoted : quotes[char]) {
      quoted = quoted ? false : char;
    }
    if (seen === EMPTY_STRING) {
      seen = initialString;
    }
    seen += char;
    if (!quoted && !escape) {
      if (char === OPENING_CURLY) {
        brackets += 1;
        started = true;
      }
      if (char === CLOSING_CURLY) {
        brackets -= 1;
      }
    }
    escape = !escape && char === ESCAPE_STRING;
    const finished = (
      !(brackets && started)
      && !quoted
      && !!endSymbol[char]
    );
    if (finished) {
      result = seen;
      seen = EMPTY_STRING;
      started = false;
      quoted = false;
      escape = false;
    }
    return finished && result;
  };
})();

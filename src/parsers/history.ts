import { EMPTY_STRING } from '../constants/constants';
import { isString } from '../utilities/typeChecks';
import { buildParseTree, createParser } from './parser';
import { DATA_CLOSING_TAGS, DATA_OPENING_TAGS } from '../constants/html';

export const parseDataOpening = createParser(buildParseTree({
  [DATA_OPENING_TAGS]: DATA_OPENING_TAGS,
}));

export const parseDataClosing = createParser(buildParseTree({
  [DATA_CLOSING_TAGS]: DATA_CLOSING_TAGS,
}));

export const parseDataFromHtml = ((): any => {
  let parsedData = EMPTY_STRING;
  let potentialData: string = EMPTY_STRING;
  let readData: boolean;

  return (html: string): string | boolean => {
    const fileContentLength = html.length;

    let charIndex = 0;
    let char: string;
    let dataComplete: string | boolean;
    let data: string;

    // eslint-disable-next-line no-plusplus
    for (charIndex; charIndex < fileContentLength; charIndex += 1) {
      char = html[charIndex];
      if (readData) {
        dataComplete = parseDataClosing(char);
        if (isString(dataComplete)) {
          data = parsedData;
          parsedData = EMPTY_STRING;
          readData = false;
          return data;
        }
        if (dataComplete) {
          potentialData += char;
        } else {
          parsedData += `${potentialData}${char}`;
          potentialData = EMPTY_STRING;
        }
      }
      if (isString(parseDataOpening(char))) {
        readData = true;
      }
    }
    return false;
  };
})();

import { resolve, sep } from 'path';
import { EOL } from 'os';

export const PERIOD = '.';
export const PASSED = 'passed';
export const FAILED = 'failed';
export const FINISHED = 'end';
export const STREAM_FINISH = 'finish';
export const STREAM_END = 'end';
export const STREAM_DATA = 'data';
export const PACKAGE_NAME = 'mocha-html-reporter';
export const JSON_EXTENSION = '.json';
export const STREAM_ERROR = 'error';
export const NEW_LINE = EOL;
export const PATH_SEPARATOR = sep;
export const TEMPLATE_BRACES = /{{.*?}}/g;
export const UUID = 'id';
export const SUITE_UUID = 'suiteId';
export const EMPTY_STRING = '';
export const PATH_TO_PACKAGE = resolve(__dirname, `..${PATH_SEPARATOR}..`);
export const TEST_DIRECTORY = 'test';
export const PATH_TO_STYLE_SHEET = `${PATH_TO_PACKAGE}${PATH_SEPARATOR}scss${PATH_SEPARATOR}main.scss`;
export const PATH_TO_SCRIPTS = `${PATH_TO_PACKAGE}${PATH_SEPARATOR}dist${PATH_SEPARATOR}scripts${PATH_SEPARATOR}main.js`;
export const MILLISECOND_SUFFIX = 'ms';
export const SECOND_SUFFIX = 's';
export const MINUTE_SUFFIX = 'm';
export const HOUR_SUFFIX = 'h';
export const ONE_MILLISECOND = 1;
export const ONE_SECOND = 1000 * ONE_MILLISECOND;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const DELAY_START_PROPERTY = '_delay';
export const SPACE = ' ';
export const VARIABLE_DECLARATION = 'var';
export const FUNCTION_DECLARATION = 'function';
export const IMPORT_DECLARATION = 'require';
export const QUOTATION_MARK = '"';
export const SINGLE_QUOTE = '\'';
export const OPENING_CURLY = '{';
export const CLOSING_CURLY = '}';
export const OPEN_PARENTHESES = '(';

export default {
  PERIOD,
  PASS: PASSED,
  FAIL: FAILED,
  FINISHED,
  PACKAGE_NAME,
  NEW_LINE,
  PATH_SEPARATOR,
  TEMPLATE_BRACES,
  UUID,
  SUITE_UUID,
  EMPTY_STRING,
  PATH_TO_PACKAGE,
  TEST_DIRECTORY,
  PATH_TO_STYLE_SHEET,
  MILLISECOND_SUFFIX,
  SECOND_SUFFIX,
  MINUTE_SUFFIX,
  HOUR_SUFFIX,
  ONE_MILLISECOND,
  ONE_SECOND,
  ONE_MINUTE,
  ONE_HOUR,
  DELAY_START_PROPERTY,
  JSON_EXTENSION,
};

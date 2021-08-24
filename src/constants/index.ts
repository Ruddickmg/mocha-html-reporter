import { resolve, sep } from 'path';
import { EOL } from 'os';
import {
  EMPTY_STRING,
  FAILED,
  HOUR_SUFFIX,
  MILLISECOND_SUFFIX,
  MINUTE_SUFFIX,
  ONE_HOUR,
  ONE_MILLISECOND,
  ONE_MINUTE,
  ONE_SECOND,
  PASSED,
  SECOND_SUFFIX,
} from '../scripts/constants';

export const PERIOD = '.';
export const FINISHED = 'end';
export const PACKAGE_NAME = 'mocha-html-reporter';
export const JSON_EXTENSION = '.json';
export const NEW_LINE = EOL;
export const PATH_SEPARATOR = sep;
export const TEMPLATE_BRACES = /{{.*?}}/g;
export const UUID = 'id';
export const SUITE_UUID = 'suiteId';
export const PATH_TO_PACKAGE = resolve(__dirname, `..${PATH_SEPARATOR}..`);
export const TEST_DIRECTORY = 'test';
export const PATH_TO_STYLE_SHEET = `${PATH_TO_PACKAGE}${PATH_SEPARATOR}scss${PATH_SEPARATOR}main.scss`;
export const PATH_TO_SCRIPTS = `${PATH_TO_PACKAGE}${PATH_SEPARATOR}dist${PATH_SEPARATOR}scripts${PATH_SEPARATOR}main.js`;
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

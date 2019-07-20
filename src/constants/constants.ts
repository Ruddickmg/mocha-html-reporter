import { sep, resolve } from 'path';

export const PERIOD = '.';
export const PASS = 'pass';
export const FAIL = 'failed';
export const FINISHED = 'end';
export const PACKAGE_NAME = 'mocha-html-reporter';
export const NEW_LINE ='\r\n';
export const PATH_SEPARATOR = sep;
export const TEMPLATE_BRACES = /{{.*?}}/g;
export const UUID = 'id';
export const SUITE_UUID = 'suiteId';
export const EMPTY_STRING = '';
export const PATH_TO_PACKAGE = resolve(__dirname, `..${PATH_SEPARATOR}..`);
export const TEST_DIRECTORY = 'test';
export const PATH_TO_STYLE_SHEET = `${PATH_TO_PACKAGE}${PATH_SEPARATOR}scss${PATH_SEPARATOR}main.scss`;
export const MILLISECOND_SUFFIX = 'ms';
export const SECOND_SUFFIX = 's';
export const MINUTE_SUFFIX = 'm';
export const HOUR_SUFFIX = 'h';
export const ONE_MILLISECOND = 1;
export const ONE_SECOND = 1000 * ONE_MILLISECOND;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const DELAY_START_PROPERTY = '_delay';

export default {
  PERIOD,
  PASS,
  FAIL,
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
};
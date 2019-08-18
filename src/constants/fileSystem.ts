import { resolve, sep } from 'path';
import { EOL } from 'os';

export const PACKAGE_NAME = 'mocha-html-reporter';
export const PATH_SEPARATOR = sep;
export const NEW_LINE = EOL;
export const PATH_TO_PACKAGE = resolve(__dirname, `..${PATH_SEPARATOR}..`);
export const TEST_DIRECTORY = 'test';
export const PATH_TO_STYLE_SHEET = `${PATH_TO_PACKAGE}${PATH_SEPARATOR}scss${PATH_SEPARATOR}main.scss`;
export const PATH_TO_SCRIPTS = `${PATH_TO_PACKAGE}${PATH_SEPARATOR}dist${PATH_SEPARATOR}scripts${PATH_SEPARATOR}main.js`;

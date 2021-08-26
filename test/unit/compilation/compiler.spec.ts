import { expect } from 'chai';
import {
  compileCode,
  combineVariablesForEachFile,
} from '../../../src/compilation';
import { variableNameGenerator } from '../../helpers/expectations';

const rootPath = '/var/www/mocha-html-reporter/test/helpers/compileFiles/';
const testImportFileName = 'main.js';
const testImportFilePath = `${rootPath}${testImportFileName}`;
const testEntryPoint = '_main.testingCompiler';

describe('compiler', (): void => {
  describe('combineVariablesForEachFile', (): void => {
    it('Renames variables from one to another in the same file', (): void => {
      const filePath = '/some/path/to/navigation.ts';
      const variables = {
        _defineProperty: 'function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n',
        _fieldsBeingShown: 'var _fieldsBeingShown = (_fieldsBeingShown = {}, _defineProperty(_fieldsBeingShown, _constants.SHOWING_PASSED, true), _defineProperty(_fieldsBeingShown, _constants.SHOWING_FAILED, true), _fieldsBeingShown);',
      };
      const expected = {
        '_navigation._defineProperty': 'function _navigation._defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }',
        '_navigation._fieldsBeingShown': 'var _navigation._fieldsBeingShown = (_navigation._fieldsBeingShown = {}, _navigation._defineProperty(_navigation._fieldsBeingShown, _constants.SHOWING_PASSED, true), _navigation._defineProperty(_navigation._fieldsBeingShown, _constants.SHOWING_FAILED, true), _navigation._fieldsBeingShown);',
      };
      expect(combineVariablesForEachFile({ [filePath]: variables }))
        .to.eql(expected);
    });
  });
  describe('compileCode', (): void => {
    it('Will compile code from a file and it\'s imports to a single string', async (): Promise<void> => {
      const result = await compileCode(testImportFilePath, variableNameGenerator(), testEntryPoint);
      expect(result)
        .to.equal('const variable1 = \'more testing\';const variable3 = \'testing 123\';const variable2 = \'still testing\';const variable4 = function variable4() {\n  console.log(variable2, variable3, variable1);\n};');
    });
  });
});

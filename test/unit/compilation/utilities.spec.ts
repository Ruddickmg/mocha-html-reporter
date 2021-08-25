import { expect } from 'chai';
import {
  addExtension,
  getFileNameFromPath,
  getFileNameFromRequire,
  getImportLines,
  getTextBetweenMarkers,
  getVariableName,
  removeFileNameFromPath,
  replaceVariablesInBulk,
} from '../../../src/compilation/utilities';
import { NEW_LINE } from '../../../src/constants';

const rootPath = '/var/www/mocha-html-reporter/test/helpers/compileFiles/';
const testImportFileName = 'main.js';
const testImportFilePath = `${rootPath}${testImportFileName}`;

describe('compiler/utilities', () => {
  describe('getVariableName', (): void => {
    ['var', 'const', 'let']
      .forEach((declaration: string): void => {
        it(`Will get a variable name from a ${declaration} declaration with var as a substring of the variable name`, (): void => {
          const variableName = 'variable';
          expect(getVariableName(`${declaration} ${variableName} = function () {};`))
            .to.equal(variableName);
        });
        it(`Will get a variable with function as a substring of the ${declaration} declaration name`, (): void => {
          const variableName = 'functional';
          expect(getVariableName(`${declaration} ${variableName} = function () {};`))
            .to.equal(variableName);
        });
        it(`Will get a variable name from a ${declaration} declaration with let as a substring of the variable name`, (): void => {
          const variableName = 'letter';
          expect(getVariableName(`${declaration} ${variableName} = function () {};`))
            .to.equal(variableName);
        });
        it(`Will get a variable with const as a substring of the ${declaration} declaration name`, (): void => {
          const variableName = 'constants';
          expect(getVariableName(`${declaration} ${variableName} = function () {};`))
            .to.equal(variableName);
        });
        it(`Will get a variable name from a ${declaration} declaration with a space between the function declaration and open parentheses`, (): void => {
          const variableName = 'b';
          expect(getVariableName(`${declaration} ${variableName} = function () {};`))
            .to.equal(variableName);
        });
        it(`will get a variable name from a function that has both a ${declaration} declaration and a function declaration`, (): void => {
          const variableName = 'z';
          expect(getVariableName(`${declaration} ${variableName} = function b() {};`))
            .to.equal(variableName);
        });
        it(`will get a variable name from a function that has both a ${declaration} declaration and a function declaration and a space after the function declaration name`, (): void => {
          const variableName = 'a';
          expect(getVariableName(`${declaration} ${variableName} = function b () {};`))
            .to.equal(variableName);
        });
      });
    it('Will get a variable name from a function declaration', (): void => {
      const variableName = 'x';
      expect(getVariableName(`function ${variableName}() {};`))
        .to.equal(variableName);
    });
    it('Will get a variable name from a function declaration with a space between the variable name and opening parentheses', (): void => {
      const variableName = 'y';
      expect(getVariableName(`function ${variableName} () {};`))
        .to.equal(variableName);
    });
    it('Will get a variable with function as a substring of the function declaration name', (): void => {
      const variableName = 'functional';
      expect(getVariableName(`function ${variableName}() {};`))
        .to.equal(variableName);
    });
  });
  describe('getTextBetweenMarkers', (): void => {
    it('Gets text from between quotation marks', (): void => {
      const text = 'hi bob';
      const line = `var x = require("${text}");`;
      expect(getTextBetweenMarkers(line, '"')).to.equal(text);
    });
    it('Will get text between two different markers', (): void => {
      const text = ' var x = 123; ';
      const line = `function setX() {${text}}`;
      expect(getTextBetweenMarkers(line, '{', '}'))
        .to.equal(text);
    });
    it('Will match via an array of markers', (): void => {
      const text = 'hi bob';
      const line = `var x = require("${text}");`;
      expect(getTextBetweenMarkers(line, ['"', '\''])).to.equal(text);
    });
  });
  describe('addTsExtension', (): void => {
    it('Add a .js extension to the end of a string', (): void => {
      const text = 'hello';
      expect(addExtension(text)).to.equal(`${text}.js`);
    });
  });
  describe('getFileNameFromRequire', (): void => {
    it('Will get a fileName from a require declaration', (): void => {
      const fileName = 'file.js';
      const path = `require("/path/to/${fileName}")`;
      expect(getFileNameFromRequire(path))
        .to.equal(fileName);
    });
  });
  describe('getFileNameFromPath', (): void => {
    const fileName = 'main';
    it('will get the file name from a path, defaulting to a .js extension', (): void => {
      expect(getFileNameFromPath(testImportFilePath)).to.equal(fileName);
    });
    it('will remove multiple extensions', (): void => {
      const extension = '.html.js';
      expect(getFileNameFromPath(`${rootPath}${fileName}${extension}`)).to.equal(fileName);
    });
  });
  describe('removeFileNameFromPath', (): void => {
    it('Removes the file name from a directory path', (): void => {
      const path = '/some/path/to';
      expect(removeFileNameFromPath(`${path}/somewhere.js`))
        .to.equal(path);
    });
  });
  describe('getImportLines', (): void => {
    it('Gets all lines of code that are import statements', (): void => {
      const lineOne = 'var _thisVar = require("./some/directory.js");';
      const lineTwo = 'var _otherVar = require("./another/directory.js");';
      expect(
        getImportLines([
          lineOne,
          'var a = 12',
          'var b = 13',
          lineTwo,
          'var c = "booo"',
        ].join(NEW_LINE)),
      ).to.eql([lineOne, lineTwo]);
    });
  });
  describe('replaceVariableNamesInBulk', (): void => {
    it('Replaces all variable names in code by a variable to key value object', (): void => {
      const variableOne = 'hi';
      const variableTwo = 'you';
      const variableThree = 'mister';
      const replacementOne = 'hello';
      const replacementTwo = 'yauAll';
      const replacementThree = 'mam';
      const replacements = {
        [variableOne]: replacementOne,
        [variableTwo]: replacementTwo,
        [variableThree]: replacementThree,
      };
      const createText = (one: string, two: string, three: string): string => `
        const fun = function() {
          const ${one} = [${two}, ${three}];
          console.log(${one});
          return ${two};
        };`;
      expect(replaceVariablesInBulk(
        replacements,
        createText(variableOne, variableTwo, variableThree),
      ))
        .to.equal(createText(replacementOne, replacementTwo, replacementThree));
    });
    it('Will not replace properties of objects that share a name with the variable name', (): void => {
      const replacement = '_main.getElementById';
      const testCode = 'const getElementById = function () { return document.getElementById };';
      const replacements = {
        getElementById: replacement,
      };
      const expected = `const ${replacement} = function () { return document.getElementById };`;
      expect(replaceVariablesInBulk(replacements, testCode)).to.equal(expected);
    });
    it('does not replace properties of objects that share a name with an indexed variable', (): void => {
      const replacement = '_typeChecks.isArray';
      const testCode = 'var isArray = typeChecks.isArray;';
      const replacements = {
        isArray: replacement,
        typeChecks: '_typeChecks.typeChecks',
      };
      const expected = `var ${replacement} = _typeChecks.typeChecks.isArray;`;
      expect(replaceVariablesInBulk(replacements, testCode)).to.equal(expected);
    });
  });
});

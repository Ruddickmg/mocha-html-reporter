import { expect } from 'chai';
import {
  getCode,
  getFileNameFromRequire,
  addExtension,
  getTextBetweenMarkers,
  removeFileNameFromPath,
  getImportLines,
  getCodeByPath,
  mapCodeBlocksToVariableNames,
  combineCodeFromFilesIntoSingleString,
  removeDuplicateCodeBlocks,
  getVariableName,
  mapFilePathsToCodeBlocksByVariableName,
  getFileNameFromPath,
  compileCode,
  replaceVariablesInBulk,
  combineVariablesForEachFile,
} from '../../src/compiler';
import { NEW_LINE, PATH_TO_SCRIPTS } from '../../src/constants';
import { variableNameGenerator } from '../helpers/expectations';
import { EMPTY_STRING } from '../../src/scripts/constants';

const rootPath = '/var/www/mocha-html-reporter/test/helpers/compileFiles/';
const testImportFileName = 'main.js';
const testImportFilePath = `${rootPath}${testImportFileName}`;
const testImportFilePathOne = `${rootPath}testFileOne.js`;
const testImportFilePathTwo = `${rootPath}testFileTwo.js`;
const testImportFilePathThree = `${rootPath}testFileThree.js`;
const recursiveImportTestFile = `${rootPath}recursiveImportTestFile.js`;
const duplicateImportTestFile = `${rootPath}duplicateImportTestFile.js`;
const circularImportTestFile = `${rootPath}circularImport.js`;
const secondCircularImportFile = `${rootPath}secondCircularImport.js`;
const firstVariableName = 'someFunk';
const secondVariableName = 'someVariable';
const thirdVariableName = 'variableThree';
const fourthVariableName = 'variableFour';
const firstCodeBlock = `var ${firstVariableName} = console.log(${secondVariableName}, ${fourthVariableName});`;
const secondCodeBlock = `var ${secondVariableName} = 25;`;
const thirdCodeBlock = `var ${thirdVariableName} = function (someVariable) { console.log(${firstVariableName}); };`;
const fourthCodeBlock = `var ${fourthVariableName} = 32;`;
const functionCodeBlock = `function () {
        console.log('hello, I am a code block!');
    var ${secondVariableName} = function () {};      };`;
const func = `var ${firstVariableName} = ${functionCodeBlock}`;
const assignmentWithoutLeadingSpaces = `var ${secondVariableName} = 'some other thing';`;
const assignment = `       ${assignmentWithoutLeadingSpaces}`;
const code = `${func}\n${assignment}`;

describe('compiler', (): void => {
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
  describe('getCodeByPath', (): void => {
    it('Can import files with circular imports', async (): Promise<void> => {
      expect(await getCodeByPath(circularImportTestFile))
        .to.eql({
          [circularImportTestFile]: await getCode(circularImportTestFile),
          [secondCircularImportFile]: await getCode(secondCircularImportFile),
        });
    });
    it('Gets all code imported by a file', async (): Promise<void> => {
      expect(await getCodeByPath(testImportFilePath))
        .to.eql({
          [testImportFilePath]: await getCode(testImportFilePath),
          [testImportFilePathOne]: await getCode(testImportFilePathOne),
          [testImportFilePathTwo]: await getCode(testImportFilePathTwo),
        });
    });
    it('Gets all code imported by files recursively', async (): Promise<void> => {
      expect(await getCodeByPath(recursiveImportTestFile))
        .to.eql({
          [recursiveImportTestFile]: await getCode(recursiveImportTestFile),
          [testImportFilePathOne]: await getCode(testImportFilePathOne),
          [testImportFilePathTwo]: await getCode(testImportFilePathTwo),
          [testImportFilePathThree]: await getCode(testImportFilePathThree),
        });
    });
    it('Gets single unique representations for imports', async (): Promise<void> => {
      expect(await getCodeByPath(duplicateImportTestFile))
        .to.eql({
          [duplicateImportTestFile]: await getCode(duplicateImportTestFile),
          [testImportFilePathOne]: await getCode(testImportFilePathOne),
          [testImportFilePathTwo]: await getCode(testImportFilePathTwo),
          [testImportFilePathThree]: await getCode(testImportFilePathThree),
        });
    });
  });
  describe('mapCodeBlocksToVariableNames', (): void => {
    it('Maps variable names to their corresponding code', (): void => {
      expect(mapCodeBlocksToVariableNames(code)).to.eql({
        [firstVariableName]: func,
        [secondVariableName]: assignmentWithoutLeadingSpaces,
      });
    });
  });
  describe('mapFilePathsToCodeBlocksByVariableName', (): void => {
    it('Creates an object containing the variable name to code block mappings for each file', (): void => {
      expect(mapFilePathsToCodeBlocksByVariableName({
        [testImportFilePath]: `${firstCodeBlock}\n${secondCodeBlock}`,
        [duplicateImportTestFile]: thirdCodeBlock,
      }))
        .to.eql({
          [testImportFilePath]: {
            [firstVariableName]: firstCodeBlock,
            [secondVariableName]: secondCodeBlock,
          },
          [duplicateImportTestFile]: {
            [thirdVariableName]: thirdCodeBlock,
          },
        });
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
  describe('combineVariablesForEachFile', (): void => {
    it('Renames variables from one to another in the same file', (): void => {
      const filePath = '/some/path/to/navigation.ts';
      const variables = {
        _defineProperty: 'function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n',
        _fieldsBeingShown: 'var _fieldsBeingShown = (_fieldsBeingShown = {}, _defineProperty(_fieldsBeingShown, _constants.SHOWING_PASSED, true), _defineProperty(_fieldsBeingShown, _constants.SHOWING_FAILED, true), _fieldsBeingShown);',
      };
      const expected = {
        '_navigation._defineProperty': 'function _navigation._defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n',
        '_navigation._fieldsBeingShown': 'var _navigation._fieldsBeingShown = (_navigation._fieldsBeingShown = {}, _navigation._defineProperty(_navigation._fieldsBeingShown, _constants.SHOWING_PASSED, true), _navigation._defineProperty(_navigation._fieldsBeingShown, _constants.SHOWING_FAILED, true), _navigation._fieldsBeingShown);',
      };
      expect(combineVariablesForEachFile({ [filePath]: variables }))
        .to.eql(expected);
    });
  });
  describe('removeDuplicateCodeBlocks', (): void => {
    it('Will remove duplicate blocks of code from a string', (): void => {
      expect(removeDuplicateCodeBlocks({
        firstCodeBlock,
        secondCodeBlock,
        thirdCodeBlock,
        fourthCodeBlock,
      }, [
        firstCodeBlock,
        secondCodeBlock,
        thirdCodeBlock,
        secondCodeBlock,
        secondCodeBlock,
        fourthCodeBlock,
        firstCodeBlock,
      ].join(EMPTY_STRING))).to.equal([
        firstCodeBlock,
        secondCodeBlock,
        thirdCodeBlock,
        fourthCodeBlock,
      ].join(EMPTY_STRING));
    });
  });
  describe('combineCodeFromFilesIntoSingleString', (): void => {
    it('Compiles a list of code blocks mapped to variable names sorted in alphabetical order according to dependency', (): void => {
      expect(combineCodeFromFilesIntoSingleString({
        [firstVariableName]: firstCodeBlock,
        [secondVariableName]: secondCodeBlock,
        [thirdVariableName]: thirdCodeBlock,
        [fourthVariableName]: fourthCodeBlock,
      })).to.equal([
        secondCodeBlock,
        fourthCodeBlock,
        firstCodeBlock,
        thirdCodeBlock,
      ].join(EMPTY_STRING));
    });
  });
  describe('compileCode', (): void => {
    it('Will compile code from a file and it\'s imports to a single string', async (): Promise<void> => {
      expect(await compileCode(testImportFilePath, variableNameGenerator()))
        .to.equal('const variable1 = \'more testing\';const variable2 = \'still testing\';const variable3 = \'testing 123\';const variable4 = function variable4() {\n  console.log(variable2, variable3, variable1);\n};');
    });
  });
});

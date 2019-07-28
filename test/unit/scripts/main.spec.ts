import { expect } from 'chai';
import {
  transformFile,
} from '@babel/core';
import {
  Compiled,
  getCode,
  getFileName,
  addTsExtension,
  getTextBetweenMarkers,
  removeFileNameFromPath,
  getImportLines,
  getCodeByPath,
  getCodeBlock,
  mapCodeBlocksToVariableNames,
  compileCode,
  removeDuplicateCodeBlocks,
  getVariableName, mapFilePathsToCodeBlocksByVariableName,
} from '../../../src/utilities/compile';
import { babelOptions } from '../../../src/constants/babelOptions';
import { EMPTY_STRING, NEW_LINE } from '../../../src/constants/constants';

const rootPath = '/var/www/root/mocha-html-reporter/test/helpers/compileFiles/';
const testImportFilePath = `${rootPath}main.ts`;
const testImportFilePathOne = `${rootPath}testFileOne.ts`;
const testImportFilePathTwo = `${rootPath}testFileTwo.ts`;
const testImportFilePathThree = `${rootPath}testFileThree.ts`;
const recursiveImportTestFile = `${rootPath}recursiveImportTestFile.ts`;
const duplicateImportTestFile = `${rootPath}duplicateImportTestFile.ts`;
const firstVariableName = '_some.func';
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
const assignment = `       var ${secondVariableName} = 'some other thing';`;
const code = `${func}\n${assignment}`;

describe('scripts', (): void => {
  describe('getVariableName', (): void => {
    it('Will get a variable name from a var declaration with var as a substring of the variable name', (): void => {
      const variableName = 'variable';
      expect(getVariableName(`var ${variableName} = function () {};`))
        .to.equal(variableName);
    });
    it('Will get a variable with function as a substring of the var declaration name', (): void => {
      const variableName = 'functional';
      expect(getVariableName(`var ${variableName} = function () {};`))
        .to.equal(variableName);
    });
    it('Will get a variable with function as a substring of the function declaration name', (): void => {
      const variableName = 'functional';
      expect(getVariableName(`function ${variableName}() {};`))
        .to.equal(variableName);
    });
    it('Will get a variable name from a var declaration with a space between the function declaration and open parentheses', (): void => {
      const variableName = 'b';
      expect(getVariableName(`var ${variableName} = function () {};`))
        .to.equal(variableName);
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
    it('will get a variable name from a function that has both a var declaration and a function declaration', (): void => {
      const variableName = 'z';
      expect(getVariableName(`var ${variableName} = function b() {};`))
        .to.equal(variableName);
    });
    it('will get a variable name from a function that has both a var declaration and a function declaration and a space after the function declaration name', (): void => {
      const variableName = 'a';
      expect(getVariableName(`var ${variableName} = function b () {};`))
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
  });
  describe('addTsExtension', (): void => {
    it('Add a .ts extension to the end of a string', (): void => {
      const text = 'hello';
      expect(addTsExtension(text)).to.equal(`${text}.ts`);
    });
  });
  describe('getFileName', (): void => {
    it('Will get a fileName from a file path', (): void => {
      const fileName = 'file.ts';
      const path = `require("/path/to/${fileName}")`;
      expect(getFileName(path))
        .to.equal(fileName);
    });
  });
  describe('removeFileNameFromPath', (): void => {
    it('Removes the file name from a directory path', (): void => {
      const path = '/some/path/to';
      expect(removeFileNameFromPath(`${path}/somewhere.ts`))
        .to.equal(path);
    });
  });
  describe('getCode', (): void => {
    it('Gets and transforms code via babel from a specified file', (done): void => {
      transformFile(
        testImportFilePath,
        babelOptions,
        async (error: Error, { code: transformedCode }: Compiled): Promise<void> => {
          try {
            expect(await getCode(testImportFilePath)).to.equal(transformedCode);
            done(error);
          } catch (e) {
            done(e);
          }
        },
      );
    });
  });
  describe('getImportLines', (): void => {
    it('Gets all lines of code that are import statements', (): void => {
      const lineOne = 'var _thisVar = require("./some/directory.ts");';
      const lineTwo = 'var _otherVar = require("./another/directory.ts");';
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
  describe('getCodeBlock', (): void => {
    it('Will parse a function to extract it from a code file', (): void => {
      expect(getCodeBlock(code)).to.equal(func);
    });
    it('Will parse an assignment to extract from a code file', (): void => {
      expect(getCodeBlock(`${assignment}\n${func}`)).to.equal(assignment);
    });
  });
  describe('mapCodeBlocksToVariableNames', (): void => {
    it('Maps variable names to their corresponding code', (): void => {
      expect(mapCodeBlocksToVariableNames(code)).to.eql({
        [firstVariableName]: func,
        [secondVariableName]: assignment,
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
  describe('renameOverlappingVariables', (): void => {
    it('Renames variable names that are overlapping between files', (): void => {

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
  describe('compileCode', (): void => {
    it('Compiles a list of code blocks mapped to variable names sorted in alphabetical order according to dependency', (): void => {
      expect(compileCode({
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
});

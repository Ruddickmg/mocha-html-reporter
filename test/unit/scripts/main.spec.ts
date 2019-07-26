import { expect } from 'chai';
import {
  transformFile,
} from '@babel/core';
import {
  Compiled,
  getCode,
  getFileName,
  addTsExtension,
  getImportVariableName,
  getTextBetweenMarkers,
  removeFileNameFromPath,
  getImportLines,
  getCodeByPath,
  getCodeBlock,
  getCodeByVariableName,
  mapFilePathsToImports,
} from "../../../src/utilities/compile";
import { babelOptions } from "../../../src/constants/babelOptions";
import {NEW_LINE, PATH_SEPARATOR} from "../../../src/constants/constants";
import {mapOverObject} from "../../../src/utilities/functions";

const rootPath = '/var/www/root/mocha-html-reporter/test/helpers/compileFiles/';
const testImportFilePath = `${rootPath}main.ts`;
const testImportFilePathOne = `${rootPath}testFileOne.ts`;
const testImportFilePathTwo = `${rootPath}testFileTwo.ts`;
const testImportFilePathThree = `${rootPath}testFileThree.ts`;
const recursiveImportTestFile = `${rootPath}recursiveImportTestFile.ts`;
const duplicateImportTestFile = `${rootPath}duplicateImportTestFile.ts`;
const firstVariableName = '_some.func';
const secondVariableName = 'someVariable';
const functionCodeBlock = 'function () {\n        console.log(\'hello, I am a code block!\');\n    var ${secondVariableName} = function () {};      };';
const func = `var ${firstVariableName} = ${functionCodeBlock}`;
const assignment = `       var ${secondVariableName} = \'some other thing\';`;
const code = `${func}\n${assignment}`;

describe('scripts', (): void => {
  describe('getImportVariableName', (): void => {
    it('Extracts a variable name from an import line', (): void => {
      const variableName = 'x';
      const importLine = `var ${variableName} = require("./some/file.ts")`;
      expect(getImportVariableName(importLine)).to.equal(variableName);
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
          async (error: Error, { code }: Compiled): Promise<void>  => {
            try {
              expect(await getCode(testImportFilePath)).to.equal(code);
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
        ].join(NEW_LINE))
      ).to.eql([lineOne, lineTwo]);
    });
  });
  describe('getCodeByPath', (): void => {
    it('Will get all code imported by a file', async (): Promise<void> => {
      expect(await getCodeByPath(testImportFilePath))
        .to.eql({
          [testImportFilePath]: await getCode(testImportFilePath),
          [testImportFilePathOne]: await getCode(testImportFilePathOne),
          [testImportFilePathTwo]: await getCode(testImportFilePathTwo),
        });
    });
    it('Will get all code imported by files recursively', async (): Promise<void> => {
      expect(await getCodeByPath(recursiveImportTestFile))
        .to.eql({
          [recursiveImportTestFile]: await getCode(recursiveImportTestFile),
          [testImportFilePathOne]: await getCode(testImportFilePathOne),
          [testImportFilePathTwo]: await getCode(testImportFilePathTwo),
          [testImportFilePathThree]: await getCode(testImportFilePathThree),
        });
    });
    it('Will only get only single representations for imports', async (): Promise<void> => {
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
  describe('getCodeByVariableName', (): void => {
    it('Maps variable names to their corresponding code', (): void => {
      expect(getCodeByVariableName(code)).to.eql({
        [firstVariableName]: func,
        [secondVariableName]: assignment,
      });
    });
  });
  describe('getImportsByFileName', (): void => {
    const filePathOne = './something.ts';
    const filePathTwo = './other';
    const importOne = `var _x = require("${filePathOne}");`;
    const importTwo = `var _y = require("${filePathTwo}");`;
    const variableOne = '_x.one';
    const variableTwo = '_x.two';
    const variableThree = '_y.three();';
    const testCode = `
      ${importOne}
      ${importTwo}
      console.log(${variableOne}, ${variableTwo});
      ${variableThree}
    `;
    it('Gets all imported variable names mapped to the file path', (): void => {
      expect(mapFilePathsToImports({ [testImportFilePath]: testCode }))
        .to.eql({
          [testImportFilePath] : mapOverObject(
            (filePath: string): string => `${rootPath}${PATH_SEPARATOR}${filePath}`,
            {
              [variableOne]: filePathOne,
              [variableTwo]: filePathOne,
              [variableThree]: filePathTwo,
            },
          ),
        });
    });
  });
});

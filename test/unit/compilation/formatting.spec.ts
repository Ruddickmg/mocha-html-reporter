import { expect } from 'chai';
import {
  mapCodeBlocksToVariableNames,
  mapFilePathsToCodeBlocksByVariableName,
} from '../../../src/compilation/formatting';

const rootPath = '/var/www/mocha-html-reporter/test/helpers/compileFiles/';
const testImportFileName = 'main.js';
const testImportFilePath = `${rootPath}${testImportFileName}`;
const duplicateImportTestFile = `${rootPath}duplicateImportTestFile.js`;
const firstVariableName = 'someFunk';
const secondVariableName = 'someVariable';
const thirdVariableName = 'variableThree';
const fourthVariableName = 'variableFour';
const firstCodeBlock = `var ${firstVariableName} = console.log(${secondVariableName}, ${fourthVariableName});`;
const secondCodeBlock = `var ${secondVariableName} = 25;`;
const thirdCodeBlock = `var ${thirdVariableName} = function (someVariable) { console.log(${firstVariableName}); };`;
const functionCodeBlock = `function () {
        console.log('hello, I am a code block!');
    var ${secondVariableName} = function () {};      };`;
const func = `var ${firstVariableName} = ${functionCodeBlock}`;
const assignmentWithoutLeadingSpaces = `var ${secondVariableName} = 'some other thing';`;
const assignment = `       ${assignmentWithoutLeadingSpaces}`;
const code = `${func}\n${assignment}`;

describe('formatting', () => {
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
});

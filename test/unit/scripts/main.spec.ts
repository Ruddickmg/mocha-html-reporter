import { expect } from 'chai';
import {
  getCode,
  getFileNameFromRequire,
  addExtension,
  getTextBetweenMarkers,
  removeFileNameFromPath,
  getImportLines,
  getCodeByPath,
  getCodeBlock,
  mapCodeBlocksToVariableNames,
  combineCodeFromFilesIntoSingleString,
  removeDuplicateCodeBlocks,
  getVariableName,
  mapFilePathsToCodeBlocksByVariableName,
  getFileNameFromPath,
  replaceVariablesInCode,
  combineVariablesForEachFile,
  renameAllVariables,
  compileCode,
} from '../../../src/utilities/compile';
import { EMPTY_STRING, NEW_LINE } from '../../../src/constants/constants';
import { mapOverObject } from '../../../src/utilities/functions';

const rootPath = '/var/www/root/mocha-html-reporter/test/helpers/compileFiles/';
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
const assignment = `       var ${secondVariableName} = 'some other thing';`;
const code = `${func}\n${assignment}`;

describe('scripts', (): void => {
  describe('Will handle circular dependencies', (): void => {

  });
  describe('replaceVariablesInCode', (): void => {
    const variable = 'hello';
    const replacement = 'holly';
    it('Ignores code within double quotes', (): void => {
      const codeString = `console.log("${variable}", "hi ${variable} goodbye")`;
      expect(replaceVariablesInCode(variable, replacement, codeString)).to.equal(codeString);
    });
    it('Ignores code within in single quotes', (): void => {
      const codeString = `console.log('${variable}', 'hi ${variable} goodbye')`;
      expect(replaceVariablesInCode(variable, replacement, codeString))
        .to.equal(codeString);
    });
    it('Ignores code the the match is a substring of', (): void => {
      const codeString = `const hi${variable} = ${variable}ending`;
      expect(replaceVariablesInCode(variable, replacement, codeString))
        .to.equal(codeString);
    });
    it('Replaces code between parentheses', (): void => {
      const fillCode = (variableName: string): string => `console.log(${variableName});`;
      expect(replaceVariablesInCode(variable, replacement, fillCode(variable)))
        .to.equal(fillCode(replacement));
    });
    it('Replaces code between brackets', (): void => {
      const fillCode = (variableName: string): string => `arr[${variableName}] = 12`;
      expect(replaceVariablesInCode(variable, replacement, fillCode(variable)))
        .to.equal(fillCode(replacement));
    });
    it('Replaces code with commas surrounding it', (): void => {
      const fillCode = (variableName: string): string => `console.log(hi,${variableName},'go')`;
      expect(replaceVariablesInCode(variable, replacement, fillCode(variable)))
        .to.equal(fillCode(replacement));
    });
    it('Replaces code with space around it', (): void => {
      const fillCode = (variableName: string): string => `var ${variableName} = '1212'`;
      expect(replaceVariablesInCode(variable, replacement, fillCode(variable)))
        .to.equal(fillCode(replacement));
    });
  });
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
  describe('combineVariablesForEachFile', (): void => {
    it('Renames variable names that are overlapping between files', (): void => {
      const firstFileName = getFileNameFromPath(testImportFilePath);
      const secondFileName = getFileNameFromPath(duplicateImportTestFile);
      const expected = {
        [`_${firstFileName}.${firstVariableName}`]: firstCodeBlock,
        [`_${firstFileName}.${secondVariableName}`]: secondCodeBlock,
        [`_${secondFileName}.${thirdVariableName}`]: thirdCodeBlock,
        [`_${secondFileName}.${firstVariableName}`]: fourthCodeBlock,
      };
      expect(combineVariablesForEachFile({
        [testImportFilePath]: {
          [firstVariableName]: firstCodeBlock,
          [secondVariableName]: secondCodeBlock,
        },
        [duplicateImportTestFile]: {
          [thirdVariableName]: thirdCodeBlock,
          [firstVariableName]: fourthCodeBlock,
        },
      })).to.eql(mapOverObject((
        codeBlock: string,
        key: string,
      ): string => replaceVariablesInCode(key.split('.').pop(), key, codeBlock), expected));
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
  describe('renameAllVariables', (): void => {
    it('Changes all variable symbols into alpha numeric strings', (): void => {
      let i = 0;
      const rename = renameAllVariables((): string => {
        i += 1;
        return `variable${i}`;
      });
      expect(rename('hi my name is bob, and my favorite activity is bob time', ['is', 'bob']))
        .to.equal('hi my name variable1 variable2, and my favorite activity variable1 variable2 time');
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
    let i = 0;
    const rename = (): string => {
      i += 1;
      return `variable${i}`;
    };
    it('Will compile code from a file and it\'s imports to a single string', async (): Promise<void> => {
      expect(await compileCode(testImportFilePath, rename))
        .to.equal('var variable3 = "more testing";var variable2 = "still testing";var variable1 = "testing 123";var variable4 = function variable4() {\r\n  console.log(variable2, variable1, variable3);\r\n};');
    });
  });
});

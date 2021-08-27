import { expect } from 'chai';
import { resolve } from 'path';
import { getCodeByPath } from '../../../src/compilation/fileSystem';
import { getCode } from '../../../src/compilation/utilities';

const rootPath = resolve(__dirname, '../../helpers/compileFiles/');
const testImportFileName = 'main.js';
const testImportFilePath = `${rootPath}/${testImportFileName}`;
const testImportFilePathOne = `${rootPath}/testFileOne.js`;
const testImportFilePathTwo = `${rootPath}/testFileTwo.js`;
const testImportFilePathThree = `${rootPath}/testFileThree.js`;
const recursiveImportTestFile = `${rootPath}/recursiveImportTestFile.js`;
const duplicateImportTestFile = `${rootPath}/duplicateImportTestFile.js`;
const circularImportTestFile = `${rootPath}/circularImport.js`;
const secondCircularImportFile = `${rootPath}/secondCircularImport.js`;

describe('fileSystem', () => {
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
});

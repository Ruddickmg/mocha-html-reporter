import { expect } from 'chai';
import { writeFileSync, mkdirSync } from 'fs';
import {
  PACKAGE_NAME,
  PATH_TO_PACKAGE,
  TEST_DIRECTORY,
} from '../../../src/constants/constants';
import {
  getPackageName,
  getFileContents,
  writeToFile,
} from '../../../src/utilities/fileSystem';
const { remove } = require('fs-extra');

describe('fileSystem', (): void => {
  const pathToMockHtml = `${PATH_TO_PACKAGE}/${TEST_DIRECTORY}/unit/html`;
  const pathToTestFile = `${pathToMockHtml}/testFile.html`;
  const testString = 'Testing 123';
  const defaultString = `Hi! ${testString}`;

  beforeEach((): void => {
    mkdirSync(pathToMockHtml);
    writeFileSync(pathToTestFile, defaultString)
  });
  afterEach(() => remove(pathToMockHtml));

  describe('getPackageName', (): void => {
    it('Will get the name of the package', () => {
      expect(getPackageName()).to.equal(PACKAGE_NAME);
    });
  });
  describe('getFileContents', (): void => {
    it('Will get the correct text from a file by path', async (): Promise<void> => {
      const fileContents = await getFileContents(pathToTestFile);
      expect(fileContents).to.equal(defaultString);
    });
  });
  describe('writeToFile', (): void => {
    it('Will write output to a file', async (): Promise<void> => {
      await writeToFile(pathToTestFile, testString);
      const fileContents = await getFileContents(pathToTestFile);

      expect(fileContents).to.equal(testString);
    });
    it('Will create a directory if one does not exist', async (): Promise<void> => {
      const pathToNonExistentDirectory = `${pathToMockHtml}/history/testFile.html`;
      await writeToFile(pathToNonExistentDirectory, testString);
      const fileContents = await getFileContents(pathToNonExistentDirectory);

      expect(fileContents).to.equal(testString);
    });
  });
});
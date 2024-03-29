import { expect } from 'chai';
import { writeFileSync, mkdirSync } from 'fs';
import {
  PATH_TO_PACKAGE,
  TEST_DIRECTORY,
} from '../../../src/constants';
import {
  getFileContents,
  writeToFile,
} from '../../../src/utilities/fileSystem';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { remove } = require('fs-extra');

describe('fileSystem', (): void => {
  const pathToMockHtml = `${PATH_TO_PACKAGE}/${TEST_DIRECTORY}/unit/html`;
  const pathToTestFile = `${pathToMockHtml}/testFile.html`;
  const testString = 'Testing 123';
  const defaultString = `Hi! ${testString}`;

  beforeEach((): void => {
    mkdirSync(pathToMockHtml);
    writeFileSync(pathToTestFile, defaultString);
  });
  afterEach(() => remove(pathToMockHtml));

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

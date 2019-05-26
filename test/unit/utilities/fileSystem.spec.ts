import { expect } from 'chai';
import {
  PACKAGE_NAME,
  PATH_TO_PACKAGE,
  PATH_TO_TEMPLATES, TEST_DIRECTORY,
} from '../../../src/utilities/constants';
import {
  getPackageName,
  getFileContents,
  writeToFile,
} from '../../../src/utilities/fileSystem';
const { copy, remove } = require('fs-extra');

describe('fileSystem', (): void => {
  const htmlTemplateFileContents = '<img src="data:image/png;base64, {{image}}" scale="0">';
  const pathToMockHtml = `${PATH_TO_PACKAGE}/${TEST_DIRECTORY}/unit/html`;
  const templateName = 'base64Image';
  const filename = `${templateName}.html`;
  const pathToTemplateFile = `${pathToMockHtml}/${filename}`;
  const testString = 'Testing 123';

  beforeEach(() => copy(PATH_TO_TEMPLATES, pathToMockHtml));
  afterEach(() => remove(pathToMockHtml));

  describe('getPackageName', (): void => {
    it('Will get the name of the package', () => {
      expect(getPackageName()).to.equal(PACKAGE_NAME);
    });
  });
  describe('getFileContents', (): void => {
    it('Will get the correct text from a file by path', async (): Promise<void> => {
      const fileContents = await getFileContents(pathToTemplateFile);
      expect(fileContents).to.contain(htmlTemplateFileContents);
    });
  });
  describe('writeToFile', (): void => {
    it('Will write output to a file', async (): Promise<void> => {
      await writeToFile(pathToTemplateFile, testString);
      const fileContents = await getFileContents(pathToTemplateFile);

      expect(fileContents).to.equal(testString);
    });
    it('Will create a directory if one does not exist', async (): Promise<void> => {
      const pathToNonExistentDirectory = `${pathToMockHtml}/history/${filename}`;
      await writeToFile(pathToNonExistentDirectory, testString);
      const fileContents = await getFileContents(pathToNonExistentDirectory);

      expect(fileContents).to.equal(testString);
    });
  });
});
import { expect } from 'chai';
import { PATH_SEPARATOR } from '../../../src/constants/constants';
import { formatOutputFilePath, removeFileName } from '../../../src/formatting/paths';

describe('paths', (): void => {
  const outputDir = 'test/unit';
  const fileName = 'testFile';
  describe('formattingOutputFilePath', (): void => {
    it('Will correctly format a path to an output file', (): void => {
      const outputPath = formatOutputFilePath(outputDir, fileName);
      const expectedPath = `${process.cwd()}${PATH_SEPARATOR}${outputDir}${PATH_SEPARATOR}${fileName}.html`;
      expect(outputPath).to.equal(expectedPath);
    });
  });
  describe('removeFileName', (): void => {
    it('Will remove a file name from the end of a path', (): void => {
      const path = '/some/path/to/file.html';
      const expected = '/some/path/to';
      expect(removeFileName(path)).to.equal(expected);
    });
  });
});

import { expect } from 'chai';
import { removeFileName } from '../../../src/formatting/paths';

describe('paths', (): void => {
  describe('removeFileName', (): void => {
    it('Will remove a file name from the end of a path', (): void => {
      const path = '/some/path/to/file.html';
      const expected = '/some/path/to';
      expect(removeFileName(path)).to.equal(expected);
    });
  });
});

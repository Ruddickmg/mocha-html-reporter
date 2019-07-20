import { Test } from 'mocha';
import { expect } from 'chai';
import { getFilePath, getParentPath } from '../../../src/parsers/path';
import { pathToMockTestDirectory } from "../../helpers/expectations";

describe('path', (): void => {
  const firstWord = 'hello';
  const secondWord = 'my';
  const thirdWord = 'friend';
  const testName = 'steve';
  const splitPath = [firstWord, secondWord, thirdWord, testName];
  describe('getFilePath', (): void => {
    const filePath = splitPath.slice(0, -1);
    it('Will parse a file path into an array of directory names, removing a portion of the path', (): any => {
      const path = `${pathToMockTestDirectory}/${firstWord}/${secondWord}/${thirdWord}/${testName}.spec.js`;
      expect(getFilePath(path, pathToMockTestDirectory)).to.eql(filePath);
    });
    it('Will parse a file path into an array of directory names, removing extensions', (): any => {
      const path = `/${firstWord}/${secondWord}/${thirdWord}/${testName}.spec.js`;
      expect(getFilePath(path)).to.eql(filePath);
    });
    it('Will parse a file without extension', (): any => {
      const path = `/${firstWord}/${secondWord}/${thirdWord}/${testName}`;
      expect(getFilePath(path)).to.eql(filePath);
    });
  });
  describe('getParentPath', (): void => {
    const test = {
      title: testName,
      parent: {
        title: thirdWord,
        parent: {
          title: secondWord,
          parent: {
            title: firstWord,
          },
        },
      },
    } as Test;
    it('Will parse a path through parent test suites', (): any => expect(getParentPath(test)).to.eql(splitPath));
  });
});

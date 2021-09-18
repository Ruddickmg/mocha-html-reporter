import { describe, Test } from 'mocha';
import { expect } from 'chai';
import { getCommonRoot, getFilePath, getParentPath } from '../../../src/parsers/path';
import { pathToMockTestDirectory } from '../../helpers/expectations';

describe('path', (): void => {
  const firstWord = 'hello';
  const secondWord = 'my';
  const thirdWord = 'friend';
  const testName = 'steve';
  const splitPath = [firstWord, secondWord, thirdWord, testName];
  describe('getCommonRoot', (): void => {
    const commonRoot = '/var/www/mocha-html-reporter/test/unit/';
    const files = [
      `${commonRoot}compilation/compiler.spec.ts`,
      `${commonRoot}compilation/fileSystem.spec.ts`,
      `${commonRoot}compilation/formatting.spec.ts`,
      `${commonRoot}compilation/sorting.spec.ts`,
      `${commonRoot}compilation/utilities.spec.ts`,
      `${commonRoot}formatting/paths.spec.ts`,
      `${commonRoot}formatting/testResults.spec.ts`,
      `${commonRoot}formatting/testSuite.spec.ts`,
      `${commonRoot}formatting/time.spec.ts`,
      `${commonRoot}parsers/code.spec.ts`,
      `${commonRoot}parsers/commandLineOptions.spec.ts`,
      `${commonRoot}parsers/history.spec.ts`,
      `${commonRoot}parsers/parser.spec.ts`,
      `${commonRoot}parsers/path.spec.ts`,
      `${commonRoot}parsers/variableDeclaration.spec.ts`,
      `${commonRoot}parsers/variableName.spec.ts`,
      `${commonRoot}report/eventHandlers.spec.ts`,
      `${commonRoot}report/styles.spec.ts`,
      `${commonRoot}templates/index.spec.ts`,
      `${commonRoot}utilities/arrays.spec.ts`,
      `${commonRoot}utilities/fileSystem.spec.ts`,
      `${commonRoot}utilities/functions.spec.ts`,
      `${commonRoot}utilities/imageComparison.spec.ts`,
      `${commonRoot}utilities/screenshots.spec.ts`,
      `${commonRoot}utilities/sorting.spec.ts`,
      `${commonRoot}utilities/strings.spec.ts`,
      `${commonRoot}utilities/topologicalSort.spec.ts`,
      `${commonRoot}utilities/typeChecks.spec.ts`,
    ];
    it('Will get the common root of a list of strings', () => {
      expect(getCommonRoot(files)).to.eql(commonRoot);
    });
  });
  describe('getFilePath', (): void => {
    const filePath = splitPath.slice(0, -1);
    it('Will parse a file path into an array of directory names, removing a portion of the path', (): void => {
      const path = `${pathToMockTestDirectory}/${firstWord}/${secondWord}/${thirdWord}/${testName}.spec.js`;
      expect(getFilePath(path, pathToMockTestDirectory)).to.eql(filePath);
    });
    it('Will parse a file path into an array of directory names, removing extensions', (): void => {
      const path = `/${firstWord}/${secondWord}/${thirdWord}/${testName}.spec.js`;
      expect(getFilePath(path)).to.eql(filePath);
    });
    it('Will parse a file without extension', (): void => {
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

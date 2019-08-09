import { Test } from 'mocha';
import { PATH_TO_PACKAGE } from '../../src/constants/constants';
import { base64NoImageString } from '../../src/constants/base64NoImageString';
import { formatDuration } from '../../src/formatting/formatting';
import { TestResult, TestSuite } from '../../src/report/eventHandlers';
import { VariableNameGenerator } from '../../src/utilities/compile';

const firstDir = 'firstDirectory';
const secondDir = 'secondDirectory';
const thirdDirOnTestOne = 'thirdDirOnTest1';
const thirdDirOnTestTwo = 'thirdDirOnTest2';
const testOne = 'testOne';
const testTwo = 'testTwo';
const testThree = 'testThree';
const suiteOne = 'testSuiteOne';
const suiteTwo = 'testSuiteTwo';
const durationOne = 1;
const durationTwo = 2;
const durationThree = 3;

export const expectedDate = Date.now();
export const expectedImage = base64NoImageString;
export const pathToMockTestDirectory = `${PATH_TO_PACKAGE}/test/mock`;
export const expectedTestResultsByPath = (state: string): TestSuite => ({
  [firstDir]: {
    [secondDir]: {
      [thirdDirOnTestOne]: {
        [suiteOne]: [{
          title: testOne,
          suite: suiteOne,
          path: [firstDir, secondDir, thirdDirOnTestOne],
          duration: durationOne,
          image: expectedImage,
          date: expectedDate,
          state,
        }],
        [suiteTwo]: [{
          title: testThree,
          suite: suiteTwo,
          path: [firstDir, secondDir, thirdDirOnTestOne],
          duration: durationThree,
          image: expectedImage,
          date: expectedDate,
          state,
        }],
      },
      [thirdDirOnTestTwo]: {
        [suiteTwo]: [{
          title: testTwo,
          suite: suiteTwo,
          path: [firstDir, secondDir, thirdDirOnTestTwo],
          duration: durationTwo,
          image: expectedImage,
          date: expectedDate,
          state,
        }],
      },
    },
  },
} as unknown as TestSuite);

export const tests = [{
  title: testOne,
  file: `${pathToMockTestDirectory}/${firstDir}/${secondDir}/${thirdDirOnTestOne}/${testOne}.spec.js`,
  image: expectedImage,
  duration: durationOne,
  parent: {
    title: suiteOne,
    parent: {
      title: thirdDirOnTestOne,
      parent: {
        title: secondDir,
        parent: {
          title: firstDir,
        },
      },
    },
  },
}, {
  title: testTwo,
  file: `${pathToMockTestDirectory}/${firstDir}/${secondDir}/${thirdDirOnTestTwo}/${testTwo}.spec.js`,
  duration: durationTwo,
  image: expectedImage,
  parent: {
    title: suiteTwo,
    parent: {
      title: thirdDirOnTestTwo,
      parent: {
        title: secondDir,
        parent: {
          title: firstDir,
        },
      },
    },
  },
}, {
  title: testThree,
  file: `${pathToMockTestDirectory}/${firstDir}/${secondDir}/${thirdDirOnTestOne}/${testThree}.spec.js`,
  duration: durationThree,
  image: expectedImage,
  parent: {
    title: suiteTwo,
    parent: {
      title: thirdDirOnTestOne,
      parent: {
        title: secondDir,
        parent: {
          title: firstDir,
        },
      },
    },
  },
}] as unknown as Test[];

export const variableNameGenerator = (): VariableNameGenerator => {
  let n = 0;
  return (): string => {
    n += 1;
    return `variable${n}`;
  };
};

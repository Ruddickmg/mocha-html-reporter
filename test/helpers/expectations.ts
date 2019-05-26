import {Test} from "mocha";
import {PATH_TO_PACKAGE} from "../../src/utilities/constants";
import { base64NoImageString } from "../../src/utilities/base64NoImageString";
import {formatDuration} from "../../src/parsers/formatting";
import {TestSuite} from "../../src/report/eventHandlers";

const firstDir = 'firstDirectory';
const secondDir = 'secondDirectory';
const thirdDirOnTestOne = 'thirdDirOnTest1';
const thirdDirOnTestTwo = 'thirdDirOnTest2';
const testOne = 'testOne';
const testTwo = 'testTwo';
const testThree = 'testThree';
const durationOne = 1;
const durationTwo = 2;
const durationThree = 3;

export const expectedImage = base64NoImageString;
export const pathToMockTestDirectory = `${PATH_TO_PACKAGE}/tests/mock`;
export const expectedTestSuite: TestSuite = {
  [firstDir]: {
    [secondDir]: {
      [thirdDirOnTestOne]: {
        [testOne]: [{
          title: testOne,
          duration: formatDuration(durationOne),
          image: expectedImage,
        }],
        [testThree]: [{
          title: testThree,
          duration: formatDuration(durationThree),
          image: expectedImage,
        }],
      },
      [thirdDirOnTestTwo]: {
        [testTwo]: [{
          title: testTwo,
          duration: formatDuration(durationTwo),
          image: expectedImage,
        }],
      }
    }
  }
} as TestSuite;

export const tests = [{
  title: testOne,
  file: `${pathToMockTestDirectory}/${firstDir}/${secondDir}/${thirdDirOnTestOne}/${testOne}.spec.js`,
  duration: durationOne,
  parent: {
    title: thirdDirOnTestOne,
    parent: {
      title: secondDir,
      parent: {
        title: firstDir,
      }
    },
  }
}, {
  title: testTwo,
  file: `${pathToMockTestDirectory}/${firstDir}/${secondDir}/${thirdDirOnTestTwo}/${testTwo}.spec.js`,
  duration: durationTwo,
  parent: {
    title: thirdDirOnTestTwo,
    parent: {
      title: secondDir,
      parent: {
        title: firstDir,
      }
    },
  }
}, {
  title: testThree,
  file: `${pathToMockTestDirectory}/${firstDir}/${secondDir}/${thirdDirOnTestOne}/${testThree}.spec.js`,
  duration: durationThree,
  parent: {
    title: thirdDirOnTestOne,
    parent: {
      title: secondDir,
      parent: {
        title: firstDir,
      }
    },
  }
}] as Test[];
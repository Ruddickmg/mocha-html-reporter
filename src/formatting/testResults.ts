import { v1 as uuid } from 'uuid';
import { Test } from 'mocha';
import { TIMEOUT } from '../scripts/constants';
import { getFilePath, getParentPath } from '../parsers/path';
import { TestResult } from '../scripts/formatting/html';

interface SuiteIds {
  [suite: string]: string;
}

export type TestResultFormatter = (test: Test, image?: string) => TestResult;

export const createTestResultFormatter = (
  pathToTestDirectory: string,
  timeOfTest: number,
  state: string,
): TestResultFormatter => {
  const suiteIds: SuiteIds = {};
  return (
    test: Test,
    image?: string,
  ): TestResult => {
    const {
      title,
      parent,
      duration,
      file,
      timedOut,
    } = test;
    const suite = parent.title;
    const suiteId = suiteIds[suite] || uuid();
    suiteIds[suite] = suiteId;
    return {
      id: uuid(),
      title,
      suite,
      suiteId,
      duration,
      state: timedOut ? TIMEOUT : state,
      date: timeOfTest,
      path: file
        ? getFilePath(file, pathToTestDirectory)
        : getParentPath(test),
      ...(!!image && { image }),
    } as TestResult;
  };
};

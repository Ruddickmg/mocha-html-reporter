import uuid from 'uuid/v1';
import { Test } from 'mocha';
import { TestResult } from '../report/eventHandlers';
import { TIMEOUT } from '../constants/cssClasses';
import { getFilePath, getParentPath } from '../parsers/path';

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

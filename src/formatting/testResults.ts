import uuid from 'uuid/v1';
import { Test } from 'mocha';
import { TIMEOUT } from '../constants/cssIdentifiers';
import { getFilePath, getParentPath } from '../parsers/path';
import { TestResult } from '../types/report';
import { SuiteIds, TestResultFormatter } from '../types/formatting';

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

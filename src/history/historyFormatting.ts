import { TestResult } from '../report/eventHandlers';
import {
  convertMillisecondsToDate,
  getMonthDayYearFromDate,
} from '../parsers/formatting';
import { sortTestResultsByDate } from '../utilities/sorting';
import { EMPTY_STRING } from '../constants/constants';
import {
  compose,
  mapOverObject,
} from '../utilities/functions';

export interface TestResultsByDate {
  [date: string]: TestResult[];
}

export interface TestResultsBySuite {
  [suite: string]: TestResult;
}

export const getEachRunDate = (history: TestResult[]): string[] => {
  const dates = history.map(({ date }: TestResult): number => date);
  return Array.from(new Set(dates))
    .sort()
    .map(convertMillisecondsToDate)
    .map(getMonthDayYearFromDate);
};

export const getEachSuiteTitle = (history: TestResult[]): string[] => Array
  .from(new Set(history.map(({ suite }: TestResult): string => suite).sort()));

export const collectTestResultsByDate = (history: TestResult[]): TestResultsByDate => history
  .reduce((tests: TestResultsByDate, test: TestResult): TestResultsByDate => {
    const dateString = getMonthDayYearFromDate(convertMillisecondsToDate(test.date));
    const testsOnSameDay = tests[dateString] || [];
    return {
      ...tests,
      [dateString]: [...testsOnSameDay, test],
    };
  }, {});

export const removeDuplicateTestResults = (testRuns: TestResult[]): TestResult[] => {
  const seenTests: any = {};
  return testRuns
    .reduce((
      mostRecentTests: TestResult[],
      test: TestResult,
    ): TestResult[] => {
      const { suite } = test;
      const testHasBeenSeen = seenTests[suite];
      seenTests[suite] = true;
      return testHasBeenSeen
        ? mostRecentTests
        : [...mostRecentTests, test];
    }, []);
};

export const indexTestResultsBySuite = (tests: TestResult[]): TestResultsBySuite => tests
  .reduce((
    testResultsBySuite: TestResultsBySuite,
    test: TestResult,
  ): TestResultsBySuite => ({
    ...testResultsBySuite,
    [test.suite]: test,
  }), {});

export const formatHistoryTable = (history: TestResult[]): any => {
  const emptyTest = { title: EMPTY_STRING } as TestResult;
  const dates = getEachRunDate(history);
  const suites = getEachSuiteTitle(history);
  const historyByDate = collectTestResultsByDate(history);
  const suiteAndDateMatrix = mapOverObject(
    compose(sortTestResultsByDate, removeDuplicateTestResults, indexTestResultsBySuite),
    historyByDate,
  );

  return dates.reduce((
    formattedHistory,
    dateString: string,
  ): any => {
    const results = suiteAndDateMatrix[dateString];
    return suites.reduce((formattedSuite: any, suiteName: string) => {
      const test = results[suiteName] || emptyTest;
      const previous = formattedSuite[suiteName] || [];
      return {
        ...formattedSuite,
        [suiteName]: [...previous, test],
      };
    }, formattedHistory);
  }, {});
};

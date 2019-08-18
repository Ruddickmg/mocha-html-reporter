import {
  convertMillisecondsToDate,
  getMonthDayYearFromDate,
  millisecondsToRoundedHumanReadable,
} from '../../utilities/time';
import { sortTestResultsByDate } from '../../utilities/sorting';
import { compose, mapOverObject } from '../../utilities/functions';
import {
  HistoryByDate,
  HistoryBySuite,
  TestResult,
  TestResultsBySuite,
} from '../../types/report';
import { EMPTY_STRING } from '../../constants/punctuation';
import { HISTORY_TABLE_TITLE } from '../../constants/html';

export const getEachRunDate = (history: TestResult[]): string[] => {
  const dates = history.map(({ date }: TestResult): number => date);
  return Array
    .from(new Set(
      dates
        .sort()
        .map(convertMillisecondsToDate)
        .map(getMonthDayYearFromDate),
    ));
};

export const getEachSuiteTitle = (history: TestResult[]): string[] => Array
  .from(new Set(history.map(({ suite }: TestResult): string => suite).sort()));

export const collectHistoryByDate = (history: TestResult[]): HistoryByDate => history
  .reduce((tests: HistoryByDate, test: TestResult): HistoryByDate => {
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

export const groupTestSuitesByDate = (testResults: TestResult[]): TestResult[][] => {
  const testResultsWithDuplicatesRemoved = mapOverObject(
    removeDuplicateTestResults,
    collectHistoryByDate(testResults),
  );
  return Object.keys(testResultsWithDuplicatesRemoved)
    .map((date: string): TestResult[] => testResultsWithDuplicatesRemoved[date]);
};

const formatHistoryByDate = compose(
  sortTestResultsByDate,
  removeDuplicateTestResults,
  indexTestResultsBySuite,
);

const getAllUniqueSuiteNames = (history: HistoryByDate): string[] => Array
  .from(
    Object
      .keys(history)
      .reduce((set: Set<string>, date: string): Set<string> => new Set([
        ...Array.from(set),
        ...history[date].map(({ suite }: TestResult): string => suite),
      ]), new Set()),
  ).sort();

export const formatHistory = (history: HistoryByDate): HistoryBySuite => {
  const emptyTest = { title: EMPTY_STRING } as TestResult;
  const dates = Object.keys(history)
    .sort((dateOne: string, dateTwo: string): number => {
      const [{ date: first }] = history[dateOne];
      const [{ date: second }] = history[dateTwo];
      return first - second;
    });
  const suites = getAllUniqueSuiteNames(history);
  const suiteAndDateMatrix = mapOverObject(formatHistoryByDate, history);

  return dates.reduce((
    formattedHistory: HistoryBySuite,
    dateString: string,
  ): HistoryBySuite => {
    const results = suiteAndDateMatrix[dateString];
    return suites.reduce((formattedSuite: HistoryBySuite, suiteName: string): HistoryBySuite => {
      const result = results[suiteName];
      const test = result
        ? { ...result, title: millisecondsToRoundedHumanReadable(result.duration) }
        : emptyTest;
      const previous = formattedSuite[suiteName] || [];
      return {
        ...formattedSuite,
        [suiteName]: [...previous, test],
      };
    }, formattedHistory);
  }, {
    [HISTORY_TABLE_TITLE]: dates
      .map((date: string): TestResult => ({ title: date } as TestResult)),
  });
};

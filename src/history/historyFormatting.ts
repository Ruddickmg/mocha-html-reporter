import { TestResult } from "../report/eventHandlers";
import { convertMillisecondsToDate } from "../parsers/formatting";

export interface TestResultsByDate {
  [date: string]: TestResult[],
}

export const getMonthDayYearFromDate = (date: Date): string => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

export const getEachRunDate = (history: TestResult[]): string[] => {
  const dates = history.map(({ date }: TestResult): number => date);
  return [...new Set(dates)]
    .sort()
    .map(convertMillisecondsToDate)
    .map(getMonthDayYearFromDate);
};

export const getEachSuiteTitle = (history: TestResult[]): string[] => [
  ...new Set(history.map(({ suite }: TestResult): string => suite).sort()),
];

export const collectTestResultsByDate = (history: TestResult[]): TestResultsByDate => history
    .reduce((tests: TestResultsByDate, test: TestResult): TestResultsByDate => {
      const dateString = getMonthDayYearFromDate(convertMillisecondsToDate(test.date));
      const testsOnSameDay = tests[dateString] || [];
      return {
        [dateString]: [...testsOnSameDay, test],
      };
    }, {});

export const formatHistoryTable = (history: TestResult[]): any => {
  const dates = getEachRunDate(history);
  const suites = getEachSuiteTitle(history);
  const historyByDate = collectTestResultsByDate(history);
};
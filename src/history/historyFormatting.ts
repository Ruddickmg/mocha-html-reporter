import { TestResult } from "../report/eventHandlers";

export interface TestResultsByDate {
  [date: string]: TestResult[],
}

export const convertMillisecondsToDate = (milliseconds: number): Date => {
  const date = new Date(0);
  date.setMilliseconds(milliseconds);
  date.setHours(date.getHours() + 1);
  return date;
};

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

export const formatHistoryTable = (history: TestResult[]): any => {
  const dates = getEachRunDate(history);
  const suites = getEachSuiteTitle(history);
  const historyByDate = history
    .reduce((tests: TestResultsByDate, test: TestResult): TestResultsByDate => {
      const dateString = getMonthDayYearFromDate(convertMillisecondsToDate(test.date));
      const testsOnSameDay = tests[dateString] || [];
      return {
        [dateString]: [...tests[dateString], test],
      };
    }, {});
};
import { expect } from 'chai';
import {
  collectHistoryByDate,
  getEachRunDate,
  getEachSuiteTitle,
  removeDuplicateTestResults,
  indexTestResultsBySuite,
  formatHistory,
} from '../../../../src/scripts/historyPage/formatHistory';
import {
  convertDateStringToMilliseconds,
  convertDateIntoMonthDayYear,
  millisecondsToRoundedHumanReadable,
} from '../../../../src/utilities/time';
import { EMPTY_STRING } from '../../../../src/constants/punctuation';
import { HistoryByDate, TestResult } from '../../../../src/types/report';
import { HISTORY_TABLE_TITLE } from '../../../../src/constants/html';

describe('historyTableFormatting', (): void => {
  const duplicateDateString = 'August 16, 1987 23:15:30';
  const duplicateMonthDayYear = '8/16/1987';
  const dates = [
    'August 13, 1987 23:15:30',
    'August 14, 1987 23:15:30',
    'August 15, 1987 23:15:30',
    duplicateDateString,
  ];
  const testResults = dates.map((dateString: string): TestResult => ({
    title: dateString,
    date: convertDateStringToMilliseconds(dateString),
  }) as TestResult);
  const datesAsMonthDayYear = [
    '8/13/1987',
    '8/14/1987',
    '8/15/1987',
    duplicateMonthDayYear,
  ];
  const firstTest = { title: 'hello', suite: 'buddy' } as TestResult;
  const secondTest = { title: 'dude', suite: 'friend' } as TestResult;
  const thirdTest = { title: 'man', suite: 'pal' } as TestResult;
  describe('getEachRunDate', (): void => {
    it('Will get dates from an ordered list of test results', (): void => {
      expect(getEachRunDate(testResults)).to.eql(datesAsMonthDayYear);
    });
  });
  describe('getEachSuiteTitle', (): void => {
    it('Retrieves suite names from test results in alphabetic order', (): void => {
      expect(getEachSuiteTitle([
        firstTest,
        secondTest,
        thirdTest,
      ] as TestResult[])).to.eql([
        firstTest.suite,
        secondTest.suite,
        thirdTest.suite,
      ]);
    });
    it('Retrieves a array of suite names without duplicates from test results', (): void => {
      expect(getEachSuiteTitle([
        firstTest,
        firstTest,
        secondTest,
        secondTest,
      ] as TestResult[])).to.eql([
        firstTest.suite,
        secondTest.suite,
      ]);
    });
  });
  describe('collectHistoryByDate', (): void => {
    it('Creates an object containing test results indexed by date', (): void => {
      expect(collectHistoryByDate(testResults)).to.eql(
        datesAsMonthDayYear
          .reduce((
            resultsByDate: HistoryByDate,
            date: string,
            index: number,
          ): HistoryByDate => ({
            ...resultsByDate,
            [date]: [testResults[index]],
          }), {}),
      );
    });
    it('Will accumulate multiple tests on the same day', (): void => {
      const testOnSameDay = {
        date: convertDateStringToMilliseconds(duplicateDateString),
        title: 'Snoz!',
      } as TestResult;
      const results = [
        ...testResults,
        testOnSameDay,
      ];
      const expected: HistoryByDate = datesAsMonthDayYear
        .reduce((
          resultsByDate: HistoryByDate,
          date: string,
          index: number,
        ): HistoryByDate => ({
          ...resultsByDate,
          [date]: [testResults[index]],
        }), {});
      expected[duplicateMonthDayYear] = [...expected[duplicateMonthDayYear], testOnSameDay];
      expect(collectHistoryByDate(results)).to.eql(expected);
    });
  });
  describe('removeDuplicateTestResults', (): void => {
    const dupe = { suite: 'duplicate' };
    const dupeTwo = { suite: 'a duplicate duplicate!' };
    const notADupe = { suite: 'not a duplicate ' };
    it('Removes test results that have the same suite title', (): void => {
      expect(removeDuplicateTestResults([
        dupe,
        dupeTwo,
        dupe,
        dupe,
        notADupe,
        dupeTwo,
      ] as TestResult[]))
        .to.eql([dupe, dupeTwo, notADupe]);
    });
  });
  describe('indexTestResultsBySuite', (): void => {
    const indexedBySuite = {
      [firstTest.suite]: firstTest,
      [secondTest.suite]: secondTest,
      [thirdTest.suite]: thirdTest,
    };
    it('Will create an object with suite names as keys and test results as values', (): void => {
      expect(indexTestResultsBySuite([firstTest, secondTest, thirdTest]))
        .to.eql(indexedBySuite);
    });
  });
  describe('formatHistory', (): void => {
    const firstSuiteName = 'suite #1';
    const secondSuiteName = 'suite #2';
    const [firstResult, secondResult] = testResults;
    const firstTestResult = {
      ...firstResult,
      suite: firstSuiteName,
      duration: 14,
      title: millisecondsToRoundedHumanReadable(14),
    } as TestResult;
    const secondTestResult = {
      ...secondResult,
      suite: secondSuiteName,
      duration: 1234,
      title: millisecondsToRoundedHumanReadable(1234),
    } as TestResult;
    it('Will include "empty test" placeholders for test runs that exist on one day but not others', (): void => {
      const differentSuites = [firstTestResult, secondTestResult];
      const omitIfDivisibleBy = 2;
      const historyByDate = dates
        .reduce((byDate: HistoryByDate, date: string, index: number): HistoryByDate => {
          const dateInMs = convertDateStringToMilliseconds(date);
          const dateString = convertDateIntoMonthDayYear(new Date(date));
          return {
            ...byDate,
            [dateString]: index % omitIfDivisibleBy === 0
              ? differentSuites
                .map((result: TestResult): TestResult => ({ ...result, date: dateInMs }))
              : [{ ...firstTestResult, date: dateInMs }],
          };
        }, {} as HistoryByDate);
      expect(formatHistory(historyByDate))
        .to.eql({
          [HISTORY_TABLE_TITLE]: dates
            .map((date: string): TestResult => ({
              title: convertDateIntoMonthDayYear(new Date(date)),
            } as TestResult)),
          [firstSuiteName]: dates
            .map((date: string): TestResult => ({
              ...firstTestResult,
              date: convertDateStringToMilliseconds(date),
            })),
          [secondSuiteName]: dates
            .map((date: string, index: number): TestResult => (
              index % omitIfDivisibleBy === 0
                ? {
                  ...secondTestResult,
                  date: convertDateStringToMilliseconds(date),
                }
                : { title: EMPTY_STRING } as TestResult
            )),
        });
    });
    it('Will format historical data to into a format parsable into an html table', (): void => {
      const differentSuites = [firstTestResult, secondTestResult];
      const historyByDate = dates
        .reduce((byDate: HistoryByDate, date: string): HistoryByDate => {
          const dateInMs = convertDateStringToMilliseconds(date);
          const dateString = convertDateIntoMonthDayYear(new Date(date));
          return {
            ...byDate,
            [dateString]: differentSuites
              .map((result: TestResult): TestResult => ({ ...result, date: dateInMs })),
          };
        }, {} as HistoryByDate);
      expect(formatHistory(historyByDate))
        .to.eql({
          [HISTORY_TABLE_TITLE]: dates
            .map((date: string): TestResult => ({
              title: convertDateIntoMonthDayYear(new Date(date)),
            } as TestResult)),
          [firstSuiteName]: dates
            .map((date: string): TestResult => ({
              ...firstTestResult,
              date: convertDateStringToMilliseconds(date),
            })),
          [secondSuiteName]: dates
            .map((date: string): TestResult => ({
              ...secondTestResult,
              date: convertDateStringToMilliseconds(date),
            })),
        });
    });
  });
});

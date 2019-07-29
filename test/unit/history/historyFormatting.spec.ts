import { expect } from 'chai';
import {
  collectTestResultsByDate,
  getEachRunDate,
  getEachSuiteTitle,
  removeDuplicateTestResults,
  indexTestResultsBySuite,
  TestResultsByDate, formatHistoryTable,
} from '../../../src/history/historyFormatting';
import { TestResult } from '../../../src/report/eventHandlers';
import { convertDateStringToMilliseconds } from '../../../src/parsers/formatting';
import { EMPTY_STRING } from '../../../src/constants/constants';

describe('historyTableFormatting', (): void => {
  const duplicateDateString = 'August 16, 1987 23:15:30';
  const duplicateMonthDayYear = '8/16/1987';
  const testResults = [
    'August 13, 1987 23:15:30',
    'August 14, 1987 23:15:30',
    'August 15, 1987 23:15:30',
    duplicateDateString,
  ].map((dateString: string): TestResult => ({
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
  describe('collectTestResultsByDate', (): void => {
    it('Creates an object containing test results indexed by date', (): void => {
      expect(collectTestResultsByDate(testResults)).to.eql(
        datesAsMonthDayYear
          .reduce((
            resultsByDate: TestResultsByDate,
            date: string,
            index: number,
          ): TestResultsByDate => ({
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
      const expected: TestResultsByDate = datesAsMonthDayYear
        .reduce((
          resultsByDate: TestResultsByDate,
          date: string,
          index: number,
        ): TestResultsByDate => ({
          ...resultsByDate,
          [date]: [testResults[index]],
        }), {});
      expected[duplicateMonthDayYear] = [...expected[duplicateMonthDayYear], testOnSameDay];
      expect(collectTestResultsByDate(results)).to.eql(expected);
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
  describe('formatHistoryTable', (): void => {
    it('Will include "empty test" placeholders for test runs that exist on one day but not others', (): void => {
      const firstSuiteName = 'suite #1';
      const secondSuiteName = 'suite #2';
      const differentSuites = testResults
        .reduce((results: TestResult[], test: TestResult, index: number): TestResult[] => [
          ...results,
          ...(index % 2 === 0 ? [{ ...test, suite: firstSuiteName }] : []),
          { ...test, suite: secondSuiteName },
        ], []);
      expect(formatHistoryTable(differentSuites))
        .to.eql({
          [firstSuiteName]: differentSuites
            .filter(({ suite }: TestResult): boolean => suite === firstSuiteName)
            .reduce((tests: TestResult[], test: TestResult): TestResult[] => [
              ...tests,
              test,
              { title: EMPTY_STRING } as TestResult,
            ], []),
          [secondSuiteName]: differentSuites
            .filter(({ suite }: TestResult): boolean => suite === secondSuiteName),
        });
    });
    it('Will format historical data to into a format parsable into an html table', (): void => {
      const firstSuiteName = 'suite #1';
      const secondSuiteName = 'suite #2';
      const differentSuites = testResults
        .reduce((results: TestResult[], test: TestResult): TestResult[] => [
          ...results,
          { ...test, suite: firstSuiteName },
          { ...test, suite: secondSuiteName },
        ], []);
      expect(formatHistoryTable(differentSuites))
        .to.eql({
          [firstSuiteName]: differentSuites
            .filter(({ suite }: TestResult): boolean => suite === firstSuiteName),
          [secondSuiteName]: differentSuites
            .filter(({ suite }: TestResult): boolean => suite === secondSuiteName),
        });
    });
  });
});

import { expect } from 'chai';
import {
  collectTestResultsByDate,
  getEachRunDate,
  getEachSuiteTitle, TestResultsByDate,
} from "../../../src/history/historyFormatting";
import { TestResult } from "../../../src/report/eventHandlers";

const convertDateStringToMilliseconds = (dateString: string): number => (new Date(dateString)).getTime();

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
  describe('getEachRunDate', (): void => {
    it('Will get dates from an ordered list of test results', (): void => {
      expect(getEachRunDate(testResults)).to.eql(datesAsMonthDayYear);
    });
  });
  describe('getEachSuiteTitle', (): void => {
    it('Retrieves suite names from test results in alphabetic order', (): void => {
      expect(getEachSuiteTitle([
        { suite: 'hello' },
        { suite: 'dude' },
        { suite: 'man'},
      ] as TestResult[])).to.eql([
        'dude',
        'hello',
        'man',
      ]);
    });
    it('Retrieves a set array of suite names from test results', (): void => {
      expect(getEachSuiteTitle([
        { suite: 'ally' },
        { suite: 'ally' },
        { suite: 'bob' },
        { suite: 'bob'},
      ] as TestResult[])).to.eql([
        'ally',
        'bob',
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
            [date]: [testResults[index]],
          }), {});
      expected[duplicateMonthDayYear] = [...expected[duplicateMonthDayYear], testOnSameDay];
      expect(collectTestResultsByDate(results)).to.eql(expected);
    });
  });
});
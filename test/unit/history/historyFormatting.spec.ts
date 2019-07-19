import { expect } from 'chai';
import {
  convertMillisecondsToDate,
  getEachRunDate,
} from "../../../src/history/historyFormatting";
import { TestResult } from "../../../src/report/eventHandlers";

describe('historyTableFormatting', (): void => {
  const testResults = [
    'August 13, 1987 23:15:30',
    'August 14, 1987 23:15:30',
    'August 15, 1987 23:15:30',
    'August 16, 1987 23:15:30',
  ].map((date: string): TestResult => ({
    title: date,
    date: (new Date(date)).getTime(),
  }) as TestResult);
  describe('convertMillisecondsToDate', (): void => {
    it('Will get convert and epoch back to it\'s original date', (): void => {
      const date = new Date();
      expect(convertMillisecondsToDate(date.getTime()).toDateString()).to.equal(date.toDateString())
    });
  });
  describe('getEachRunDate', (): void => {
    it('Will get dates from an ordered list of test results', (): void => {
      expect(getEachRunDate(testResults)).to.eql([
        '8/13/1987',
        '8/14/1987',
        '8/15/1987',
        '8/16/1987',
      ]);
    });
  });
});
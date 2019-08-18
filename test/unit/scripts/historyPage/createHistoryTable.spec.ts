import { expect } from 'chai';
import { convertDateStringToMilliseconds } from '../../../../src/utilities/time';
import { TestResult } from '../../../../src/types/report';
import { createHistoryTable } from '../../../../src/scripts/historyPage/createHistoryTable';

describe('createHistoryTable', (): void => {
  describe('convertArrayIntoTableRow', (): void => {});
  describe('convertArrayIntoTableHeader', (): void => {});
  describe('createHistoryTable', (): void => {
    const firstSuiteName = 'suite #1';
    const secondSuiteName = 'suite #2';
    const testResults = [
      'August 13, 1987 23:15:30',
      'August 14, 1987 23:15:30',
      'August 15, 1987 23:15:30',
      'August 16, 1987 23:15:30',
    ].map((dateString: string): TestResult => ({
      title: dateString,
      date: convertDateStringToMilliseconds(dateString),
    } as TestResult))
      .reduce((results: TestResult[], test: TestResult): TestResult[] => [
        ...results,
        { ...test, suite: firstSuiteName },
        { ...test, suite: secondSuiteName },
      ], []);
    it('Converts history data into a table displaying test results over time', (): void => {
      // const history = formatHistory(testResults);
      // expect(createHistoryTable(history))
      //   .to.equal({});
    });
  });
});

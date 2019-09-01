import { expect } from 'chai';
import {
  convertDateIntoMonthDayYear,
  convertDateStringToMilliseconds,
  convertMillisecondsToDate, millisecondsToRoundedHumanReadable
} from '../../../../src/utilities/time';
import { HistoryByDate, TestResult } from '../../../../src/types/report';
import {
  convertArrayToHistoryTableHeader,
  convertArrayToTableRow,
  convertTestResultToHistoryTableData,
  convertTestResultToHistoryTableHeader,
  createHistoryTable,
} from '../../../../src/scripts/historyPage/createHistoryTable';
import { createTable, createTableData, createTableHeader, createTableRow } from '../../../../src/scripts/elements';
import { TEST_FAILED, TEST_PASSED } from '../../../../src/constants/mocha';
import {
  HISTORY_TABLE,
  HISTORY_TABLE_HEADER,
  HISTORY_TABLE_ROW,
  TEST_RESULT_BUTTON,
} from '../../../../src/constants/cssIdentifiers';
import { HISTORY_TABLE_TITLE } from '../../../../src/constants/html';
import { formatHistory } from '../../../../src/scripts/historyPage/formatHistory';
import { compose } from '../../../../src/utilities/functions';

describe('createHistoryTable', (): void => {
  const id = 'testId';
  const title = 'testTitle';
  describe('convertTestResultToHistoryTableData', (): void => {
    [TEST_PASSED, TEST_FAILED]
      .forEach((state: string): any => it(`Will convert a tables data for a ${state} test`, (): void => {
        expect(convertTestResultToHistoryTableData({
          id,
          title,
          state,
        } as TestResult))
          .to.eql(createTableData(
            {
              id,
              class: `${state} ${TEST_RESULT_BUTTON}`,
            },
            title,
          ));
      }));
  });
  describe('convertTestResultToHistoryTableHeader', (): void => {
    expect(convertTestResultToHistoryTableHeader({ title } as TestResult))
      .to.eql(createTableData({}, title));
  });
  describe('convertArrayIntoTableRow', (): void => {
    const testResults = [
      { title, id, state: TEST_PASSED },
      { title, id, state: TEST_FAILED },
    ] as TestResult[];
    it('will convert an array of test results into a table row', (): void => {
      expect(convertArrayToTableRow(testResults))
        .to.eql(createTableRow(
          { class: HISTORY_TABLE_ROW },
          testResults.map(convertTestResultToHistoryTableData),
        ));
    });
  });
  describe('convertArrayToHistoryTableHeader', (): void => {
    const testResults = [
      { title },
      { title },
    ] as TestResult[];
    it('Will convert an array of test result objects into a table header', (): void => {
      expect(convertArrayToHistoryTableHeader(testResults))
        .to.eql(createTableHeader(
          { class: HISTORY_TABLE_HEADER },
          testResults.map(convertTestResultToHistoryTableHeader),
        ));
    });
  });
  describe('createHistoryTable', (): void => {
    const firstSuiteName = 'suite #1';
    const secondSuiteName = 'suite #2';
    const dates = [
      'August 13, 1987 23:15:30',
      'August 14, 1987 23:15:30',
      'August 15, 1987 23:15:30',
      'August 16, 1987 23:15:30',
    ];
    const testResults = dates.map((dateString: string): TestResult => ({
      title: dateString,
      date: convertDateStringToMilliseconds(dateString),
    } as TestResult))
      .reduce((results: TestResult[], test: TestResult): TestResult[] => [
        ...results,
        { ...test, suite: firstSuiteName },
        { ...test, suite: secondSuiteName },
      ], []) as TestResult[];
    const testsByDate = testResults
      .reduce((results: HistoryByDate, result: TestResult): HistoryByDate => {
        const dateString = convertDateIntoMonthDayYear(convertMillisecondsToDate(result.date));
        return {
          ...results,
          [dateString]: [...(results[dateString] || []), result],
        };
      }, {} as HistoryByDate);
    it('Converts history data into a table displaying test results over time', (): void => {
      const history = formatHistory(testsByDate);
      expect(createHistoryTable(history))
        .to.eql(createTable(
          { id: HISTORY_TABLE },
          [
            createTableHeader(
              { class: HISTORY_TABLE_HEADER },
              [
                createTableData({}, HISTORY_TABLE_TITLE),
                ...dates.map((date: string): Element => createTableData(
                  {},
                  compose(
                    convertDateStringToMilliseconds,
                    convertMillisecondsToDate,
                    convertDateIntoMonthDayYear,
                  )(date),
                )),
              ],
            ),
            createTableRow(
              { class: HISTORY_TABLE_ROW },
              [
                convertTestResultToHistoryTableData({ title: firstSuiteName } as TestResult),
                ...testResults
                  .filter(({ suite }: TestResult): boolean => suite === firstSuiteName)
                  .map((result: TestResult): TestResult => ({
                    ...result,
                    title: millisecondsToRoundedHumanReadable(result.duration),
                  }))
                  .map(convertTestResultToHistoryTableData),
              ],
            ),
            createTableRow(
              { class: HISTORY_TABLE_ROW },
              [
                convertTestResultToHistoryTableData({ title: secondSuiteName } as TestResult),
                ...testResults
                  .filter(({ suite }: TestResult): boolean => suite === secondSuiteName)
                  .map((result: TestResult): TestResult => ({
                    ...result,
                    title: millisecondsToRoundedHumanReadable(result.duration),
                  }))
                  .map(convertTestResultToHistoryTableData),
              ],
            ),
          ],
        ));
    });
  });
});

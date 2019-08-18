import { HistoryBySuite, TestResult } from '../../types/report';
import {
  createTable,
  createTableData,
  createTableHeader,
  createTableRow,
} from '../elements';
import {
  HISTORY_TABLE,
  HISTORY_TABLE_HEADER,
  HISTORY_TABLE_ROW,
  TEST_RESULT_BUTTON,
} from '../../constants/cssIdentifiers';
import { HISTORY_TABLE_TITLE } from '../../constants/html';

export const convertTestResultToHistoryTableData = (
  { title, id, state }: TestResult,
): Element => createTableData(
  {
    id,
    class: `${state} ${TEST_RESULT_BUTTON}`,
  },
  title,
);

export const convertTestResultToHistoryTableHeader = (
  { title }: TestResult,
): Element => createTableData({}, title);

export const convertArrayToTableRow = (
  data: TestResult[],
): Element => createTableRow(
  { class: HISTORY_TABLE_ROW },
  data.map(convertTestResultToHistoryTableData),
);

export const convertArrayToHistoryTableHeader = (
  data: TestResult[],
): Element => createTableHeader(
  { class: HISTORY_TABLE_HEADER },
  data.map(convertTestResultToHistoryTableHeader),
);

export const createHistoryTable = (history: HistoryBySuite): Element => {
  const headers = convertArrayToHistoryTableHeader([
    { title: HISTORY_TABLE_TITLE } as TestResult,
    ...(history[HISTORY_TABLE_TITLE] || []),
  ]);
  return createTable(
    { id: HISTORY_TABLE },
    [
      headers,
      ...Object.keys(history)
        .filter((testSuiteName: string): boolean => testSuiteName !== HISTORY_TABLE_TITLE)
        .map((testSuiteName: string): Element => {
          const testSuite = history[testSuiteName] || [];
          const testWithId = testSuite.find(({ suiteId }: TestResult): boolean => !!suiteId);
          const suiteId = testWithId && testWithId.suiteId;
          return convertArrayToTableRow(
            [
              { title: testSuiteName, id: suiteId },
              ...testSuite,
            ] as TestResult[],
          );
        }),
    ],
  );
};

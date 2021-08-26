import { isArray } from '../utilities/typeChecks';
import {
  FAILED,
  HIDDEN,
  HISTORY_TABLE,
  HISTORY_TABLE_DATA,
  HISTORY_TABLE_HEADER,
  HISTORY_TABLE_ROW,
  PASSED,
  TEST_RESULT,
  TEST_RESULT_BUTTON,
  TEST_SUITE,
  TEST_SUITE_CONTENT,
  TEST_SUITE_TITLE,
} from '../constants';
import { History, historyTestSuiteHeaderTitle } from './history';
import { createElement, TagName } from '../elements';
import { formatTestResult } from './results';

export interface Content {
  [name: string]: string;
}

export interface TestSuite {
  [directory: string]: TestSuite | TestResult[] | Content | string;
}

export interface TestResult {
  duration: number;
  date: number;
  id: string;
  image?: string;
  path: string[];
  class?: string;
  suite: string;
  state: string;
  suiteId: string;
  title: string;
}

export interface ReportData {
  reportTitle: string;
  pageTitle: string;
  styles?: string;
  scripts?: string;
  history?: TestResult[];
}

interface ParsedSuite {
  results: Element[];
  suiteFailed: boolean;
}

interface ImageDetails { image: string, scale?: number }

export const createImageElement = ({ image, scale = 0 }: ImageDetails): Element => {
  const imageDisplay = createElement(TagName.image);
  imageDisplay.setAttribute('src', `data:image/png;base64,${image}`);
  imageDisplay.setAttribute('scale', `${scale}`);
  return imageDisplay;
};

export const convertTestResultsToHtml = (
  testResults: TestResult[],
): Element[] => testResults
  .map((result): Element => {
    const { image, state, title }: TestResult = result;
    const element = createElement(TagName.li);
    const titleElement = createElement(TagName.h3);
    const resultDisplay = createElement(TagName.h4);
    titleElement.innerHTML = title;
    resultDisplay.innerHTML = formatTestResult(result);
    element.className = `${TEST_RESULT} ${state} ${HIDDEN}`;
    element.appendChild(titleElement);
    element.appendChild(resultDisplay);
    if (image) element.appendChild(createImageElement({ image }));
    return element;
  });

export const convertTestSuiteToHtml = (
  testSuite: TestSuite,
): Element => {
  const mainElement = createElement(TagName.ul);
  const parseSuite = (suite: TestSuite): ParsedSuite => {
    let suiteFailed = false;
    const results = Object.keys(suite)
      .map((title: string): Element => {
        let content: Element[];
        const current = suite[title];
        const testResultElement = createElement(TagName.li);
        const titleElement = createElement(TagName.h2);
        const contentElement = createElement(TagName.ul);
        titleElement.innerHTML = title;
        if (isArray(current)) {
          suiteFailed = !!(current as TestResult[])
            .find(({ state }: TestResult): boolean => state === FAILED);
          content = convertTestResultsToHtml(current as TestResult[]);
        } else {
          const { results: testResults, suiteFailed: failed } = parseSuite(current as TestSuite);
          // eslint-disable-next-line prefer-destructuring
          suiteFailed = failed;
          content = testResults;
        }
        content.forEach((element) => contentElement.appendChild(element));
        titleElement.className = TEST_SUITE_TITLE;
        contentElement.className = TEST_SUITE_CONTENT;
        testResultElement.className = `${TEST_SUITE} ${suiteFailed ? FAILED : PASSED} ${HIDDEN}`;
        testResultElement.appendChild(titleElement);
        testResultElement.appendChild(contentElement);

        return testResultElement;
      });
    return { results, suiteFailed };
  };
  const { results } = parseSuite(testSuite);
  results.forEach((element) => mainElement.appendChild(element));
  mainElement.className = TEST_SUITE_CONTENT;
  return mainElement;
};

export const convertArrayToTableRow = (data: TestResult[]): Element => {
  const element = createElement(TagName.tableRow);
  element.className = HISTORY_TABLE_ROW;
  data.forEach(({ title, state, id }: TestResult): void => {
    const tableData = createElement(TagName.tableData);
    const button = createElement(TagName.button);
    button.id = id;
    button.innerHTML = title;
    button.className = `${state} ${TEST_RESULT_BUTTON}`;
    tableData.className = HISTORY_TABLE_DATA;
    tableData.appendChild(button);
    element.appendChild(tableData);
  });
  return element;
};

export const convertArrayToTableHeader = (data: TestResult[]): Element => {
  const element = createElement(TagName.tableRow);
  element.className = HISTORY_TABLE_HEADER;
  data.forEach(({ title }: TestResult): void => {
    const tableData = createElement(TagName.tableData);
    tableData.innerHTML = title;
    element.appendChild(tableData);
  });
  return element;
};

export const convertHistoryToHtml = (history: History): Element => {
  const header = [
    { title: historyTestSuiteHeaderTitle },
    ...(history[historyTestSuiteHeaderTitle] || []),
  ] as TestResult[];
  const historyTable = createElement(TagName.table);
  historyTable.id = HISTORY_TABLE;
  [
    convertArrayToTableHeader(header),
    ...Object.keys(history)
      .filter((testSuiteName: string): boolean => testSuiteName !== historyTestSuiteHeaderTitle)
      .map((testSuiteName: string): Element => {
        const testSuite = history[testSuiteName] || [];
        const testWithId = testSuite.find(({ suiteId }: TestResult): boolean => !!suiteId);
        const id = testWithId && testWithId.suiteId;
        return convertArrayToTableRow(
          [
            { title: testSuiteName, id },
            ...testSuite,
          ] as TestResult[],
        );
      }),
  ].map((element) => historyTable.appendChild(element));
  return historyTable;
};

export const convertSuitesToHtml = (testSuites: History): Element => convertHistoryToHtml(
  testSuites,
);

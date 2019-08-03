import { minify as minifyHtml } from 'html-minifier';
import { minify as minifyJavascript } from 'uglify-js';
import { ReportData, TestResult, TestSuite } from './eventHandlers';
import { NEW_LINE } from '../constants/constants';
import { isArray } from '../utilities/typeChecks';
import { History, historyTestSuiteHeaderTitle } from '../history/historyFormatting';
import { minifyHtmlConfiguration } from '../configuraton/html-minifier.config';
import {
  addValuesToTemplate,
  clearAllTemplateValues,
  imageTemplate,
  reportTemplate,
  tableDataTemplate,
  tableHeaderTemplate,
  tableRowTemplate,
  tableTemplate,
  testResultTemplate,
  testSuiteTemplate,
} from '../templates/all';
import { uglifyJsConfiguration } from '../configuraton/uglify-js.config';
import { logError } from '../utilities/logging';

export const convertTestResultsToHtml = (
  testResults: TestResult[],
): string => testResults
  .map((
    { image, ...results }: TestResult,
  ): string => addValuesToTemplate(testResultTemplate, {
    ...(!!image && {
      image: addValuesToTemplate(imageTemplate, { image }),
    }),
    ...results,
  }))
  .join(NEW_LINE);

export const convertTestSuiteToHtml = (
  testSuite: TestSuite,
): string => (function parseSuite(suite: TestSuite): string {
  const template = testSuiteTemplate;
  return Object.keys(suite)
    .map((title: string): string => {
      const current = suite[title];
      return addValuesToTemplate(
        template,
        {
          content: isArray(current)
            ? convertTestResultsToHtml(current as TestResult[])
            : parseSuite(current as TestSuite),
          title,
        },
      );
    })
    .join(NEW_LINE);
}(testSuite));

export const convertArrayToTableRow = (
  data: TestResult[],
  dataTemplate: string,
): string => addValuesToTemplate(
  tableRowTemplate,
  {
    content: data.map(({ title }: TestResult): string => addValuesToTemplate(
      dataTemplate,
      { content: title },
    )).join(NEW_LINE),
  },
);

export const convertHistoryToHtml = (history: History): string => {
  const header = [
    { title: historyTestSuiteHeaderTitle },
    ...(history[historyTestSuiteHeaderTitle] || []),
  ] as TestResult[];
  return addValuesToTemplate(
    tableTemplate,
    {
      id: 'history-table',
      content: [
        convertArrayToTableRow(header, tableHeaderTemplate),
        Object.keys(history)
          .filter((testSuiteName: string): boolean => testSuiteName !== historyTestSuiteHeaderTitle)
          .map((testSuiteName: string): string => convertArrayToTableRow(
            [
              { title: testSuiteName },
              ...(history[testSuiteName] || []),
            ] as TestResult[],
            tableDataTemplate,
          )).join(NEW_LINE),
      ].join(NEW_LINE),
    },
  );
};

export const convertSuitesToHtml = (
  reportData: ReportData,
  testSuites: TestSuite[],
): string => addValuesToTemplate(reportTemplate, {
  suites: testSuites
    .map(convertTestSuiteToHtml)
    .join(NEW_LINE),
  ...reportData,
});

export const cleanAndMinify = (
  html: string,
): string => minifyHtml(clearAllTemplateValues(html), minifyHtmlConfiguration);

export const minifyJs = (prettyCode: string): string => {
  const { code, error } = minifyJavascript(prettyCode, uglifyJsConfiguration);
  if (error) {
    logError('Error in minification,', error);
  }
  return code;
};

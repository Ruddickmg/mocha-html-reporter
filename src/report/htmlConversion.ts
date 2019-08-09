import CleanCss from 'clean-css';
import { minify as minifyHtml } from 'html-minifier';
import { minify as minifyJavascript } from 'uglify-js';
import { Content, ReportData, TestResult, TestSuite } from './eventHandlers';
import { FAILED, NEW_LINE, PASSED } from '../constants/constants';
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
  buttonTemplate,
} from '../templates/all';
import { uglifyJsConfiguration } from '../configuraton/uglify-js.config';
import { logError } from '../utilities/logging';
import { cleanCssConfiguration } from '../configuraton/clean-css.config';
import {
  HIDDEN,
  HISTORY_TABLE,
  HISTORY_TABLE_DATA,
  HISTORY_TABLE_HEADER,
  HISTORY_TABLE_ROW, TEST_RESULT,
  TEST_RESULT_BUTTON, TEST_SUITE,
} from '../constants/cssClasses';
import { millisecondsToRoundedHumanReadable } from '../formatting/time';

export const convertTestResultsToHtml = (
  testResults: TestResult[],
): string => testResults
  .map(({
    image,
    state,
    duration,
    title,
  }: TestResult): string => addValuesToTemplate(testResultTemplate, {
    title,
    class: `${TEST_RESULT} ${state} hidden`,
    ...(!!image && {
      image: addValuesToTemplate(imageTemplate, { image }),
    }),
    duration: millisecondsToRoundedHumanReadable(duration as number),
  }))
  .join(NEW_LINE);

interface ParsedSuite {
  results: string;
  suiteFailed: boolean;
}

export const convertTestSuiteToHtml = (
  testSuite: TestSuite,
): string => {
  const parseSuite = (suite: TestSuite): ParsedSuite => {
    let suiteFailed: boolean;
    const results = Object.keys(suite)
      .map((title: string): string => {
        let content: ParsedSuite | string;
        const current = suite[title];
        if (isArray(current)) {
          suiteFailed = !!(current as TestResult[])
            .find(({ state }: TestResult): boolean => state === FAILED);
          content = convertTestResultsToHtml(current as TestResult[]);
        } else {
          content = parseSuite(current as TestSuite) as ParsedSuite;
          // eslint-disable-next-line prefer-destructuring
          suiteFailed = content.suiteFailed;
        }
        return addValuesToTemplate(
          testSuiteTemplate,
          {
            class: `${TEST_SUITE} ${suiteFailed ? FAILED : PASSED} ${HIDDEN}`,
            content: (content as ParsedSuite).results || content,
            title,
          } as Content,
        );
      })
      .join(NEW_LINE);
    return { results, suiteFailed };
  };
  return parseSuite(testSuite).results;
};

export const convertArrayToTableRow = (
  data: TestResult[],
  dataTemplate: string,
): string => addValuesToTemplate(
  tableRowTemplate,
  {
    class: HISTORY_TABLE_ROW,
    content: data.map(({ title, state, id }: TestResult): string => addValuesToTemplate(
      dataTemplate,
      {
        class: HISTORY_TABLE_DATA,
        content: addValuesToTemplate(
          buttonTemplate,
          { content: title, id, class: `${state} ${TEST_RESULT_BUTTON}` },
        ),
      },
    )).join(NEW_LINE),
  },
);

export const convertArrayToTableHeader = (
  data: TestResult[],
  dataTemplate: string,
): string => addValuesToTemplate(
  tableRowTemplate,
  {
    class: HISTORY_TABLE_HEADER,
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
      id: HISTORY_TABLE,
      content: [
        convertArrayToTableHeader(header, tableHeaderTemplate),
        Object.keys(history)
          .filter((testSuiteName: string): boolean => testSuiteName !== historyTestSuiteHeaderTitle)
          .map((testSuiteName: string): string => {
            const testSuite = history[testSuiteName] || [];
            const testWithId = testSuite.find(({ suiteId }: TestResult): boolean => !!suiteId);
            const id = testWithId && testWithId.suiteId;
            return convertArrayToTableRow(
              [
                { title: testSuiteName, id },
                ...testSuite,
              ] as TestResult[],
              tableDataTemplate,
            );
          }).join(NEW_LINE),
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

export const cleanAndMinifyHtml = (
  html: string,
): string => minifyHtml(clearAllTemplateValues(html), minifyHtmlConfiguration);

export const minifyJs = (prettyCode: string): string => {
  const { code, error } = minifyJavascript(prettyCode, uglifyJsConfiguration);
  if (error) {
    logError('Error in minification,', error);
  }
  return code;
};

export const minifyCss = (css: string): Promise<any> => new CleanCss(cleanCssConfiguration)
  .minify(css);

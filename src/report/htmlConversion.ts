import { ReportData, TestResult, TestSuite } from './eventHandlers';
import { NEW_LINE } from '../constants/constants';
import { isArray } from '../utilities/typeChecks';
import {
  reportTemplate,
  imageTemplate,
  testResultTemplate,
  testSuiteTemplate,
  addValuesToTemplate,
} from '../templates/all';
import {History} from "../history/historyFormatting";

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

export const convertReportToHtml = (
  reportData: ReportData,
  testSuite: TestSuite,
): string => addValuesToTemplate(reportTemplate, {
  suites: convertTestSuiteToHtml(testSuite),
  ...reportData,
});

export const convertHistoryToHtml = (history: History): string => {
  // TODO
};

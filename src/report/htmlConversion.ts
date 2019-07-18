import { addValuesToTemplate, Templates } from '../templates';
import { ReportData, TestResult, TestSuite } from './eventHandlers';
import { NEW_LINE } from '../constants';
import { isArray } from '../utilities/typeChecks';

export const convertReportToHtml = (
  reportData: ReportData,
  testSuite: TestSuite,
  {
    reportTemplate,
    ...templates
  }: Templates,
): string => addValuesToTemplate(reportTemplate, {
  suites: convertTestSuiteToHtml(testSuite, templates),
  ...reportData,
});

export const convertTestResultsToHtml = (
  testResults: TestResult[],
  testResultTemplate: string,
  imageTemplate: string,
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
  {
    testSuiteTemplate,
    testResultTemplate,
    imageTemplate,
  }: Templates,
): string => (function parseSuite(suite: TestSuite): string {
  const template = testSuiteTemplate;
  return Object.keys(suite)
    .map((title: string): string => {
      const current = suite[title];
      return addValuesToTemplate(
        template,
        {
          content: isArray(current)
            ? convertTestResultsToHtml(current as TestResult[], testResultTemplate, imageTemplate)
            : parseSuite(current as TestSuite),
          title,
        },
      );
    })
    .join(NEW_LINE);
})(testSuite);
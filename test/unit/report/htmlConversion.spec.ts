import { expect } from 'chai';
import {
  convertTestResultsToHtml,
  convertTestSuiteToHtml,
  convertReportToHtml,
} from '../../../src/report/htmlConversion';
import {
  addValuesToTemplate,
  imageTemplate,
  testResultTemplate,
  testSuiteTemplate,
  reportTemplate,
} from '../../../src/templates/all';
import {
  NEW_LINE,
  PATH_SEPARATOR,
  PATH_TO_STYLE_SHEET,
} from '../../../src/constants/constants';
import { TestResult, TestSuite } from '../../../src/report/eventHandlers';
import { formatDuration } from '../../../src/parsers/formatting';
import { getStyles } from '../../../src/parsers/styles';
import { pathToMockTestDirectory } from '../../helpers/expectations';

describe('testResult', () => {
  const image = 'test image';
  const title = 'some title';
  const firstTitle = 'hello';
  const testDuration = 1337;
  const mockTestValues = [{
    title: firstTitle,
    duration: testDuration,
  }, {
    title: 'world',
    duration: testDuration,
  }];
  const mockTestResults: TestResult[] = mockTestValues
    .map(({ duration, ...rest }): TestResult => ({
      duration: formatDuration(duration),
      path: pathToMockTestDirectory.split(PATH_SEPARATOR),
      ...rest,
    }) as TestResult);

  describe('convertTestResultsToHtml', (): void => {
    it('Will add an image if there is one present on the passed in object', async (): Promise<void> => {
      const expectedAddition = addValuesToTemplate(
        imageTemplate,
        { image } as TestResult,
      );
      expect(convertTestResultsToHtml(
        [{
          title: 'whatever', duration: formatDuration(testDuration), path: [], image,
        } as TestResult],
      )).to.contain(expectedAddition);
    });

    it('Will add all values and return correctly formatted html output', async (): Promise<void> => {
      const expectedResults = mockTestResults.map(
        (result: TestResult): string => addValuesToTemplate(
          testResultTemplate,
          result as TestResult,
        ),
      );

      expect(convertTestResultsToHtml(
        mockTestResults,
      )).to.equal(expectedResults.join(NEW_LINE));
    });

    it('Will add images to the html output', async (): Promise<void> => {
      const expectedResults = mockTestResults.map(
        (result: TestResult): string => addValuesToTemplate(
          testResultTemplate,
          {
            image: addValuesToTemplate(imageTemplate, { image } as TestResult),
            ...result,
          } as TestResult,
        ),
      );

      expect(convertTestResultsToHtml(
        mockTestResults.map((results: TestResult): TestResult => ({ image, ...results })),
      ))
        .to.equal(expectedResults.join(NEW_LINE));
    });
  });
  describe('convertTestSuiteToHtml', (): void => {
    it('Will convert a test suite into the desired html output', async (): Promise<void> => {
      const testResult: TestResult = {
        title,
        duration: formatDuration(testDuration),
        image,
      } as TestResult;
      const imageHtml = addValuesToTemplate(imageTemplate, { image } as TestResult);
      const testResultHtml = addValuesToTemplate(testResultTemplate, {
        title,
        duration: testDuration,
        image: imageHtml,
      } as TestResult);
      const testSuiteHtml = addValuesToTemplate(testSuiteTemplate, {
        title,
        content: testResultHtml,
      });
      const testSuite = {
        [title]: [testResult],
      } as TestSuite;

      expect(convertTestSuiteToHtml(testSuite)).to.equal(testSuiteHtml);
    });
  });
  describe('convertReportToHtml', () => {
    it('Will convert a test suite into an html report', async (): Promise<void> => {
      const styles = await getStyles(PATH_TO_STYLE_SHEET);
      const suite = 'some suite';
      const testResult = {
        title,
        suite,
        duration: formatDuration(testDuration),
        image,
      } as TestResult;
      const imageHtml = addValuesToTemplate(imageTemplate, { image } as TestResult);
      const testResultHtml = addValuesToTemplate(testResultTemplate, {
        title,
        duration: testDuration,
        image: imageHtml,
      } as TestResult);
      const testSuiteHtml = addValuesToTemplate(testSuiteTemplate, {
        title,
        content: testResultHtml,
      });
      const testSuite = {
        [title]: [testResult],
      } as TestSuite;
      const reportData = {
        reportTitle: 'test title',
        pageTitle: 'This is a test',
        styles,
      };
      const reportHtml = addValuesToTemplate(reportTemplate, {
        suites: testSuiteHtml,
        ...reportData,
      });

      expect(convertReportToHtml(reportData, testSuite)).to.equal(reportHtml);
    });
  });
});

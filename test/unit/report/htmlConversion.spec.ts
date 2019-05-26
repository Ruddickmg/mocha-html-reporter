import {expect} from 'chai';
import {
  convertTestResultsToHtml,
  convertTestSuiteToHtml,
  convertReportToHtml,
} from '../../../src/report/htmlConversion';
import {
  addValuesToTemplate,
  getTemplate,
  getTemplates,
  Templates,
} from "../../../src/parsers/templating";
import {
  IMAGE_TEMPLATE,
  NEW_LINE, PATH_TO_STYLE_SHEET,
  TEST_RESULT_TEMPLATE,
} from "../../../src/utilities/constants";
import { TestResult, TestSuite } from "../../../src/report/eventHandlers";
import { formatDuration } from "../../../src/parsers/formatting";
import {getStyles} from "../../../src/report/styles";

describe('testResult', () => {
  const image = 'test image';
  const title = 'some title';
  const firstTitle = 'hello';
  const duration = 1337;
  const mockTestValues = [{
    title: firstTitle,
    duration,
  }, {
    title: 'world',
    duration,
  }];
  const mockTestResults = mockTestValues
    .map(({duration, ...rest}) => ({
      duration: formatDuration(duration),
      ...rest,
    }));

  describe('convertTestResultsToHtml',() => {
    it('Will add an image if there is one present on the passed in object', async () => {
      const testResultTemplate = await getTemplate(TEST_RESULT_TEMPLATE);
      const imageTemplate = await getTemplate(IMAGE_TEMPLATE);
      const image = 'testing123';
      const expectedAddition = addValuesToTemplate(imageTemplate, { image });

      expect(convertTestResultsToHtml(
        [{ title: 'whatever', duration: formatDuration(duration), image }],
        testResultTemplate,
        imageTemplate,
      )).to.contain(expectedAddition);
    });

    it('Will add all values and return correctly formatted html output', async (): Promise<void> => {
      const testResultTemplate = await getTemplate(TEST_RESULT_TEMPLATE);
      const imageTemplate = await getTemplate(IMAGE_TEMPLATE);
      const expectedResults = mockTestResults.map(
        (result: TestResult): string => addValuesToTemplate(
          testResultTemplate,
          result as TestResult,
        ),
      );

      expect(convertTestResultsToHtml(
        mockTestResults,
        testResultTemplate,
        imageTemplate,
      )).to.equal(expectedResults.join(NEW_LINE));
    });

    it('Will add images to the html output', async (): Promise<void> => {
      const testResultTemplate = await getTemplate(TEST_RESULT_TEMPLATE);
      const imageTemplate = await getTemplate(IMAGE_TEMPLATE);
      const image = "some image";
      const expectedResults = mockTestResults.map(
        (result: TestResult): string => addValuesToTemplate(
          testResultTemplate,
          {
            image: addValuesToTemplate(imageTemplate, { image }),
            ...result,
          } as TestResult,
        ),
      );

      expect(convertTestResultsToHtml(
        mockTestResults.map((results: TestResult): TestResult => ({ image, ...results })),
        testResultTemplate,
        imageTemplate,
      ))
        .to.equal(expectedResults.join(NEW_LINE));
    });
  });
  describe('convertTestSuiteToHtml', (): void => {

    it('Will convert a test suite into the desired html output', async (): Promise<void> => {
      const templates = await getTemplates();
      const {
        imageTemplate,
        testResultTemplate,
        testSuiteTemplate,
      }: Templates = templates;
      const testResult = {
        title,
        duration: formatDuration(duration),
        image,
      } as TestResult;
      const imageHtml = addValuesToTemplate(imageTemplate, { image });
      const testResultHtml = addValuesToTemplate(testResultTemplate, {
        title,
        duration,
        image: imageHtml,
      });
      const testSuiteHtml = addValuesToTemplate(testSuiteTemplate, {
        title,
        content: testResultHtml,
      });
      const testSuite = {
        [title]: [testResult],
      } as TestSuite;

      expect(convertTestSuiteToHtml(testSuite, templates)).to.equal(testSuiteHtml);
    });
  });
  describe('convertReportToHtml', () => {

    it('Will convert a test suite into an html report', async (): Promise<void> => {
      const templates = await getTemplates();
      const styles = await getStyles(PATH_TO_STYLE_SHEET);
      const {
        imageTemplate,
        testResultTemplate,
        testSuiteTemplate,
        reportTemplate,
      }: Templates = templates;
      const testResult = {
        title,
        duration: formatDuration(duration),
        image,
      } as TestResult;
      const imageHtml = addValuesToTemplate(imageTemplate, { image });
      const testResultHtml = addValuesToTemplate(testResultTemplate, {
        title,
        duration,
        image: imageHtml,
      });
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

      expect(convertReportToHtml(reportData, testSuite, templates)).to.equal(reportHtml);
    });
  });
});
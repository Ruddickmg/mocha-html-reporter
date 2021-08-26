import { expect } from 'chai';
import {
  FAILED,
  HIDDEN, HISTORY_TABLE_DATA, HISTORY_TABLE_HEADER,
  HISTORY_TABLE_ROW,
  PASSED,
  TEST_RESULT, TEST_RESULT_BUTTON,
  TEST_SUITE,
  TEST_SUITE_CONTENT,
  TEST_SUITE_TITLE,
} from '../../../../src/scripts/constants';

import {
  convertTestSuiteToHtml,
  convertTestResultsToHtml, createImageElement,
  TestResult, TestSuite, convertArrayToTableRow, convertArrayToTableHeader, convertHistoryToHtml,
// convertHistoryToHtml,
// convertSuitesToHtml,
// convertTestResultsToHtml,
//   convertTestSuiteToHtml,
} from '../../../../src/scripts/formatting/html';
import { TagName } from '../../../../src/scripts/elements';
import { formatTestResult } from '../../../../src/scripts/formatting/results';
import { convertDateStringToMilliseconds } from '../../../../src/scripts/formatting/time';

describe('testResult', () => {
  const first = 0;
  const second = 1;
  const third = 2;
  const image = 'testImage';
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

  describe('convertTestResultsToHtml', (): void => {
    [PASSED]
      .forEach((state: string): void => {
        const mockTestResults: TestResult[] = mockTestValues
          .map(({ duration, ...rest }): TestResult => ({
            duration,
            state,
            ...rest,
          }) as TestResult);
        it(`Adds an image if there is one present on the passed in object ${state}`, async (): Promise<void> => {
          const [firstResult] = mockTestResults;
          const commonAttribute = 'src';
          const [element] = convertTestResultsToHtml([{ image, ...firstResult }]);
          const expectedImage = createImageElement({ image });
          const imageElement = element.getElementsByTagName(TagName.image).item(0);
          expect(imageElement[commonAttribute])
            .to.equal(expectedImage.getAttribute(commonAttribute));
        });
        it('Adds the title to the title element', async (): Promise<void> => {
          const [firstResult] = mockTestResults;
          const [element] = convertTestResultsToHtml(mockTestResults);
          const titleElement = element.getElementsByTagName(TagName.h3).item(0);
          expect(titleElement.innerHTML).to.equal(firstResult.title);
        });
        it('Adds content to the test result element', async (): Promise<void> => {
          const [firstResult] = mockTestResults;
          const [element] = convertTestResultsToHtml(mockTestResults);
          const titleElement = element.getElementsByTagName(TagName.h4).item(0);
          expect(titleElement.innerHTML).to.equal(formatTestResult(firstResult));
        });
      });
  });
  describe('convertTestSuiteToHtml', (): void => {
    [PASSED, FAILED]
      .forEach((state: string): void => {
        const suiteName = 'heyyo!';
        const testResult: TestResult = {
          title,
          duration: testDuration,
          state,
          image,
        } as TestResult;
        const testSuite: TestSuite = {
          [suiteName]: [testResult],
        };
        const converted = convertTestSuiteToHtml(testSuite);
        it('sets the correct class on the top element', () => {
          expect(converted.className).to.equal(TEST_SUITE_CONTENT);
        });
        describe(`${state} test suite element`, () => {
          const testSuiteElement = converted.children.item(first);
          it('sets the correct class on the test suite element', () => {
            expect(testSuiteElement.className).to.contain(TEST_SUITE);
          });
          it(`sets the success status of the test suite to ${state} in it's class name when the test suite contains a ${state} test`, () => {
            expect(testSuiteElement.className).to.contain(state);
          });
          describe(`${state} title element`, () => {
            const titleElement = testSuiteElement.children.item(first);
            it('adds a title element at the top of the test suite', () => {
              expect(titleElement.className).to.equal(TEST_SUITE_TITLE);
            });
            it('sets the text of the title element to the test suite name', () => {
              expect(titleElement.innerHTML).to.equal(suiteName);
            });
          });
          describe(`${state} test suite content`, () => {
            const contentElement = testSuiteElement.children.item(second);
            it('adds a content element below the title with the correct class name', () => {
              expect(contentElement.className).to.equal(TEST_SUITE_CONTENT);
            });
            describe('test result', () => {
              const testResultElement = contentElement.children.item(first);
              it('it sets the correct classname on the test result element', () => {
                expect(testResultElement.className).to.contain(TEST_RESULT);
              });
              it(`sets the success status of the test result's classname to ${state}`, () => {
                expect(testResultElement.className).to.contain(state);
              });
              it(`adds ${HIDDEN} to the test result's class name`, () => {
                expect(testResultElement.className).to.contain(HIDDEN);
              });
              it('contains an element with the test result title as the first element', () => {
                const titleElement = testResultElement.children.item(first);
                expect(titleElement.innerHTML).to.equal(title);
              });
              it(`creates an element containing the ${state} status of the test result and it's duration`, () => {
                const resultElement = testResultElement.children.item(second);
                expect(resultElement.innerHTML).to.equal(`${state} ${testDuration}`);
              });
              it('creates an element containing an image if one is present in the result', () => {
                const imageElement = testResultElement.children.item(third);
                expect(imageElement.getAttribute('src')).to.contain(image);
              });
            });
          });
        });
        it(`Will convert a test suite into the desired html output for a ${state} test`, async (): Promise<void> => {
          expect(converted.innerHTML)
            .to
            .equal(`<li class="test-suite ${state} hidden"><h2 class="test-suite-title">${suiteName}</h2><ul class="test-suite-content"><li class="test-result ${state} hidden"><h3>${title}</h3><h4>${state} ${testDuration}</h4><img src="data:image/png;base64,testImage" scale="0"></li></ul></li>`);
        });
      });
  });
  describe('convertArrayIntoTableRow', (): void => {
    const secondTitle = 'billy';
    const thirdTitle = 'bob';
    [PASSED, FAILED]
      .forEach((state: string): void => {
        const testResults = [
          { title: firstTitle, state, id: firstTitle },
          { title: secondTitle, state, id: secondTitle },
          { title: thirdTitle, state, id: thirdTitle },
        ].map(({ id, ...data }) => ({
          ...data,
          id: `${id}-id`,
        })) as TestResult[];
        it(`sets table class name for ${state} test table row`, (): void => {
          expect(convertArrayToTableRow(testResults).className).to.equal(HISTORY_TABLE_ROW);
        });
        it(`adds a class name to each ${state} tests data element`, (): void => {
          const dataElements = convertArrayToTableRow(testResults).children;
          testResults.forEach((_, index) => {
            expect(dataElements.item(index).className).to.equal(HISTORY_TABLE_DATA);
          });
        });
        it('creates a button for each button labeled by it\'s title', () => {
          const dataElements = convertArrayToTableRow(testResults).children;
          testResults.forEach(({ title: testResultTitle }, index) => {
            const resultElement = dataElements.item(index).children.item(first);
            expect(resultElement.innerHTML).to.equal(testResultTitle);
          });
        });
        it(`adds the test result id to each button labeled for ${state} tests`, () => {
          const dataElements = convertArrayToTableRow(testResults).children;
          testResults.forEach(({ id }, index) => {
            const resultElement = dataElements.item(index).children.item(first);
            expect(resultElement.id).to.equal(id);
          });
        });
        it(`adds the ${state} success status to each button's class name`, () => {
          const dataElements = convertArrayToTableRow(testResults).children;
          testResults.forEach((_, index) => {
            const resultElement = dataElements.item(index).children.item(first);
            expect(resultElement.className).to.contain(state);
          });
        });
        it(`adds ${TEST_RESULT_BUTTON} to each class name for ${state} test buttons`, () => {
          const dataElements = convertArrayToTableRow(testResults).children;
          testResults.forEach((_, index) => {
            const resultElement = dataElements.item(index).children.item(first);
            expect(resultElement.className).to.contain(TEST_RESULT_BUTTON);
          });
        });
      });
  });
  describe('convertArrayIntoTableHeader', (): void => {
    const secondTitle = 'billy';
    const thirdTitle = 'bob';
    const testResults = [
      { title: firstTitle },
      { title: secondTitle },
      { title: thirdTitle },
    ] as TestResult[];
    it('adds correct class name to table header element', (): void => {
      expect(convertArrayToTableHeader(testResults).className).to.equal(HISTORY_TABLE_HEADER);
    });
    it('creates an element for each title', (): void => {
      const elements = convertArrayToTableHeader(testResults).children;
      testResults.forEach(({ title: resultTitle }, index) => {
        const column = elements.item(index);
        expect(column.innerHTML).to.equal(resultTitle);
      });
    });
  });
  describe('convertHistoryToHtml', (): void => {
    const firstSuiteName = 'suite #1';
    const secondSuiteName = 'suite #2';
    const suiteName = 'testSuiteHistory';
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
    // it('Converts history data into a table displaying test results over time', (): void => {
    //   expect(convertHistoryToHtml({ [suiteName]: testResults }).innerHTML).to.equal(false);
    // });
  });
  describe('convertSuitesToHtml', (): void => {
    [PASSED, FAILED]
      .forEach((state: string): void => {
        const firstSuiteName = 'suite #1';
        const secondSuiteName = 'suite #2';
        const suiteName = 'testSuiteHistory';
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
        it(`Will convert a test suite into an html report for ${state} tests`, async (): Promise<void> => {
          expect(true).to.equal(true);
        });
      });
  });
});

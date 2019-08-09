import { expect } from 'chai';
import {
  convertTestResultsToHtml,
  convertTestSuiteToHtml,
  convertSuitesToHtml,
  convertHistoryToHtml,
  convertArrayToTableRow, convertArrayToTableHeader,
} from '../../../src/report/htmlConversion';
import {
  addValuesToTemplate,
  imageTemplate,
  testResultTemplate,
  testSuiteTemplate,
  reportTemplate,
  tableTemplate,
  tableHeaderTemplate,
  tableDataTemplate,
  tableRowTemplate, buttonTemplate,
} from '../../../src/templates/all';
import {
  FAILED,
  NEW_LINE, PASSED,
  PATH_SEPARATOR,
} from '../../../src/constants/constants';
import { TestResult, TestSuite } from '../../../src/report/eventHandlers';
import {
  convertDateStringToMilliseconds,
} from '../../../src/formatting/time';
import { pathToMockTestDirectory } from '../../helpers/expectations';
import { formatHistory, historyTestSuiteHeaderTitle } from '../../../src/history/historyFormatting';
import {
  HISTORY_TABLE_DATA, HISTORY_TABLE_ROW, TEST_RESULT, TEST_RESULT_BUTTON, TEST_SUITE,
} from '../../../src/constants/cssClasses';
import { HIDDEN } from '../../../src/scripts/constants';

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
  const testResultClass = (state: string): string => `${TEST_RESULT} ${state} ${HIDDEN}`;
  const testSuiteClass = (state: string): string => `${TEST_SUITE} ${state} ${HIDDEN}`;

  describe('convertTestResultsToHtml', (): void => {
    [PASSED, FAILED]
      .forEach((state: string): void => {
        const mockTestResults: TestResult[] = mockTestValues
          .map(({ duration, ...rest }): TestResult => ({
            duration,
            path: pathToMockTestDirectory.split(PATH_SEPARATOR),
            state,
            ...rest,
          }) as TestResult);
        it(`Will add an image if there is one present on the passed in object ${state}`, async (): Promise<void> => {
          const expectedAddition = addValuesToTemplate(
            imageTemplate,
            { image } as TestResult,
          );
          expect(convertTestResultsToHtml(
            [{
              title: 'whatever',
              state,
              duration: testDuration,
              path: [],
              image,
            } as TestResult],
          )).to.contain(expectedAddition);
        });
        it(`Will add all values and return correctly formatted html output for a ${state} test`, async (): Promise<void> => {
          const expectedResults = mockTestResults.map(
            (result: TestResult): string => addValuesToTemplate(
              testResultTemplate,
              {
                class: testResultClass(state),
                ...result,
              },
            ),
          );
          expect(convertTestResultsToHtml(
            mockTestResults,
          )).to.equal(expectedResults.join(NEW_LINE));
        });
        it(`Will add images to the html output for a ${state} test`, async (): Promise<void> => {
          const expectedResults = mockTestResults.map(
            (result: TestResult): string => addValuesToTemplate(
              testResultTemplate,
              {
                class: testResultClass(state),
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
  });
  describe('convertTestSuiteToHtml', (): void => {
    [PASSED, FAILED]
      .forEach((state: string): void => {
        it(`Will convert a test suite into the desired html output for a ${state} test`, async (): Promise<void> => {
          const testResult: TestResult = {
            title,
            duration: testDuration,
            state,
            image,
          } as TestResult;
          const imageHtml = addValuesToTemplate(imageTemplate, { image } as TestResult);
          const testResultHtml = addValuesToTemplate(testResultTemplate, {
            title,
            class: testResultClass(state),
            duration: testDuration,
            image: imageHtml,
          } as TestResult);
          const testSuiteHtml = addValuesToTemplate(testSuiteTemplate, {
            title,
            class: testSuiteClass(state),
            content: testResultHtml,
          });
          const testSuite = {
            [title]: [testResult],
          } as TestSuite;

          expect(convertTestSuiteToHtml(testSuite)).to.equal(testSuiteHtml);
        });
      });
  });
  describe('convertArrayIntoTableRow', (): void => {
    const secondTitle = 'billy';
    const thirdTitle = 'bob';
    [PASSED, FAILED]
      .forEach((state: string): void => {
        const testResults = [
          { title: firstTitle, state },
          { title: secondTitle, state },
          { title: thirdTitle, state },
        ] as TestResult[];
        it(`Will convert an array into a table header row for ${state} tests`, (): void => {
          expect(convertArrayToTableRow(testResults, tableHeaderTemplate))
            .to.equal(addValuesToTemplate(
              tableRowTemplate,
              {
                content: testResults
                  .map(({
                    title: currentTitle,
                    state: resultState,
                  }: TestResult): string => addValuesToTemplate(
                    tableHeaderTemplate,
                    {
                      class: HISTORY_TABLE_ROW,
                      content: addValuesToTemplate(
                        buttonTemplate,
                        {
                          content: currentTitle,
                          class: `${resultState} ${TEST_RESULT_BUTTON}`,
                        },
                      ),
                    },
                  )).join(NEW_LINE),
              },
            ));
        });
        it(`Will convert an array into a table data row for ${state} tests`, (): void => {
          expect(convertArrayToTableRow(testResults, tableDataTemplate))
            .to.equal(addValuesToTemplate(
              tableRowTemplate,
              {
                class: HISTORY_TABLE_ROW,
                content: testResults
                  .map(({
                    title: currentTitle,
                    state: resultState,
                  }: TestResult): string => addValuesToTemplate(
                    tableDataTemplate,
                    {
                      class: HISTORY_TABLE_DATA,
                      content: addValuesToTemplate(
                        buttonTemplate,
                        {
                          content: currentTitle,
                          class: `${resultState} ${TEST_RESULT_BUTTON}`,
                        },
                      ),
                    },
                  )).join(NEW_LINE),
              },
            ));
        });
      });
  });
  describe('convertArrayIntoTableHeader', (): void => {
    const secondTitle = 'billy';
    const thirdTitle = 'bob';
    [PASSED, FAILED]
      .forEach((state: string): void => {
        const testResults = [
          { title: firstTitle, state },
          { title: secondTitle, state },
          { title: thirdTitle, state },
        ] as TestResult[];
        it(`Will convert an array into a table header row for ${state} tests`, (): void => {
          expect(convertArrayToTableHeader(testResults, tableHeaderTemplate))
            .to.equal(addValuesToTemplate(
              tableRowTemplate,
              {
                content: testResults
                  .map(({ title: currentTitle }: TestResult): string => addValuesToTemplate(
                    tableHeaderTemplate,
                    { content: currentTitle },
                  )).join(NEW_LINE),
              },
            ));
        });
        it(`Will convert an array into a table data row ${state} tests`, (): void => {
          expect(convertArrayToTableHeader(testResults, tableDataTemplate))
            .to.equal(addValuesToTemplate(
              tableRowTemplate,
              {
                content: testResults
                  .map(({ title: currentTitle }: TestResult): string => addValuesToTemplate(
                    tableDataTemplate,
                    { content: currentTitle },
                  )).join(NEW_LINE),
              },
            ));
        });
      });
  });
  describe('convertHistoryToHtml', (): void => {
    const firstSuiteName = 'suite #1';
    const secondSuiteName = 'suite #2';
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
    it('Converts history data into a table displaying test results over time', (): void => {
      const history = formatHistory(testResults);
      expect(convertHistoryToHtml(history))
        .to.equal(addValuesToTemplate(tableTemplate, {
          id: 'history-table',
          content: [
            convertArrayToTableHeader(
              [
                { title: historyTestSuiteHeaderTitle } as TestResult,
                ...history[historyTestSuiteHeaderTitle],
              ],
              tableHeaderTemplate,
            ),
          ].concat(Object.keys(history)
            .filter((suiteName: string): boolean => suiteName !== historyTestSuiteHeaderTitle)
            .map((suiteName: string): string => convertArrayToTableRow(
              [{ title: suiteName } as TestResult, ...history[suiteName]],
              tableDataTemplate,
            ))).join(NEW_LINE),
        }));
    });
  });
  describe('convertSuitesToHtml', (): void => {
    [PASSED, FAILED]
      .forEach((state: string): void => {
        it(`Will convert a test suite into an html report for ${state} tests`, async (): Promise<void> => {
          const suite = 'some suite';
          const imageHtml = addValuesToTemplate(imageTemplate, { image } as TestResult);
          const reportData = {
            reportTitle: 'test title',
            pageTitle: 'This is a test',
          };
          const testResult = {
            title,
            suite,
            duration: testDuration,
            image,
            state,
          } as TestResult;
          const testResultHtml = addValuesToTemplate(testResultTemplate, {
            title,
            class: testResultClass(state),
            duration: testDuration,
            image: imageHtml,
          } as TestResult);
          const testSuiteHtml = addValuesToTemplate(testSuiteTemplate, {
            title,
            class: testSuiteClass(state),
            content: testResultHtml,
          });
          const testSuites = [{
            [title]: [testResult],
          }] as TestSuite[];
          const reportHtml = addValuesToTemplate(reportTemplate, {
            suites: testSuiteHtml,
            ...reportData,
          });
          expect(convertSuitesToHtml(reportData, testSuites)).to.equal(reportHtml);
        });
      });
  });
});

import { Test } from 'mocha';
import { expect } from 'chai';
import { FAILED, PASSED } from '../../../src/constants/constants';
import { pathToMockTestDirectory } from '../../helpers/expectations';
import { isString } from '../../../src/utilities/typeChecks';
import { createTestResultFormatter } from '../../../src/formatting/testResults';

describe('testResults', (): void => {
  const parentTitle = 'I am a test suite';
  const parent = { title: parentTitle };
  const firstTitle = 'hello';
  const duration = 4;
  const mockDirectory = `${pathToMockTestDirectory}/some/other/directory`;
  describe('createTestResultFormatter', (): void => {
    const date = Date.now();
    [PASSED, FAILED]
      .forEach((state: string): void => {
        const mockTestValues = [{
          duration,
          file: mockDirectory,
          state: PASSED,
          parent,
          title: firstTitle,
        }, {
          duration,
          file: mockDirectory,
          parent,
          state: PASSED,
          title: 'world',
        }];
        const expected = {
          title: firstTitle,
          suite: parentTitle,
          date,
          path: [
            'some',
            'other',
          ],
          state,
          duration,
        };
        const formatTestResults = createTestResultFormatter(pathToMockTestDirectory, date, state);
        it(`Will format test results correctly from the raw test data for ${state} tests`, (): void => {
          const [firstTestResult] = mockTestValues;
          const { id, suiteId, ...result } = formatTestResults(firstTestResult as Test);

          expect(isString(suiteId)).to.equal(true);
          expect(isString(id)).to.equal(true);
          expect(result).to.eql(expected);
        });
        it(`Will add an image to the test results for ${state} tests`, (): void => {
          const [firstTestResult] = mockTestValues;
          const image = '12345';
          const { id, suiteId, ...result } = formatTestResults(firstTestResult as Test, image);

          expect(isString(suiteId)).to.equal(true);
          expect(isString(id)).to.equal(true);
          expect(result)
            .to.eql({ image, state, ...expected });
        });
      });
  });
});

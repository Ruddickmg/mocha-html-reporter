import { expect } from 'chai';
import {
  buildStringOfTruthyValues,
  Environment, ExpectedOptions, formatDuration, formatOutputFilePath, formatTestResults, getAmountOfExcess,
  getCommandLineOptions, removeFileName
} from "../../../src/parsers/formatting";
import {
  HOUR_SUFFIX, MILLISECOND_SUFFIX, MINUTE_SUFFIX, ONE_HOUR, ONE_MILLISECOND, ONE_MINUTE, ONE_SECOND,
  PATH_SEPARATOR, SECOND_SUFFIX
} from "../../../src/utilities/constants";
import {Test} from "mocha";

describe('formatting', () => {
  const outputDir = 'test/unit';
  const fileName = 'testFile';
  const firstTitle = 'hello';
  const duration = 4;
  const mockTestValues = [{
    title: firstTitle,
    duration,
  }, {
    title: 'world',
    duration,
  }];

  describe('formatTestResults', (): void => {
    it ('Will format test results correctly from the raw test data', () => {
      const [firstTestResult] = mockTestValues;

      expect(formatTestResults(firstTestResult as Test))
        .to.eql({
          title: firstTitle,
          duration: formatDuration(duration),
        });
    });
    it('Will add an image to the test results', (): void => {
      const [firstTestResult] = mockTestValues;
      const image = '12345';

      expect(formatTestResults(firstTestResult as Test, image))
        .to.eql({
          title: firstTitle,
          duration: formatDuration(duration),
          image,
        });
    });
  });
  describe('formattingOutputFilePath', (): void => {
    it('Will correctly format a path to an output file', (): void => {
      const outputPath = formatOutputFilePath(outputDir, fileName);
      const expectedPath = `${process.cwd()}${PATH_SEPARATOR}${outputDir}${PATH_SEPARATOR}${fileName}.html`;
      expect(outputPath).to.equal(expectedPath);
    });
  });
  describe('getCommandLineOptions', (): void => {
    it ('Will extract options from the "environment" passed in from the mocha test runner', (): void => {
      const reporterOptions = {
        outputDir,
        fileName,
        testDir: '/someOtherDirectory',
        screenShotEachTest: true,
        screenShotOnFailure: true,
      } as ExpectedOptions;
      const environment: Environment = { reporterOptions };
      expect(getCommandLineOptions(environment))
        .to.eql(reporterOptions);
    });
    it('Will return an empty object if no environment is found', (): void => {
      expect(getCommandLineOptions()).to.eql({});
    });
  });
  describe('formatDuration', (): void => {
    it(`Will return "${MILLISECOND_SUFFIX} when the duration is zero`, (): void => {
      expect(formatDuration(0))
        .to.equal(`0 ${MILLISECOND_SUFFIX}`);
    });
    it(`Will parse ${MILLISECOND_SUFFIX} a string containing hours`, (): void => {
      expect(formatDuration(ONE_HOUR))
        .to.equal(`1 ${HOUR_SUFFIX}`);
    });
    it(`Will parse ${MILLISECOND_SUFFIX} a string containing minutes`, (): void => {
      expect(formatDuration(ONE_MINUTE))
        .to.equal(`1 ${MINUTE_SUFFIX}`);
    });
    it(`Will parse ${MILLISECOND_SUFFIX} a string containing seconds`, (): void => {
      expect(formatDuration(ONE_SECOND))
        .to.equal(`1 ${SECOND_SUFFIX}`);
    });
    it(`Will parse ${MILLISECOND_SUFFIX} a string containing milliseconds`, (): void => {
      expect(formatDuration(ONE_MILLISECOND))
        .to.equal(`1 ${MILLISECOND_SUFFIX}`);
    });
    it(`Will parse ${MILLISECOND_SUFFIX} a string containing seconds and milliseconds`, (): void => {
      expect(formatDuration(ONE_SECOND + ONE_MILLISECOND))
        .to.equal(`1 ${SECOND_SUFFIX}, 1 ${MILLISECOND_SUFFIX}`);
    });
    it('Will parse a string into minutes and seconds', (): void => {
      expect(formatDuration(ONE_MINUTE + ONE_SECOND))
        .to.equal(`1 ${MINUTE_SUFFIX}, 1 ${SECOND_SUFFIX}`);
    });
    it(`Will parse ${MILLISECOND_SUFFIX} a string containing hours and seconds`, (): void => {
      expect(formatDuration(ONE_HOUR + ONE_SECOND))
        .to.equal(`1 ${HOUR_SUFFIX}, 1 ${SECOND_SUFFIX}`);
    });
    it(`Will parse ${MILLISECOND_SUFFIX} a string containing milliseconds and minutes`, () => {
      expect(formatDuration(ONE_MINUTE + ONE_MILLISECOND))
        .to.equal(`1 ${MINUTE_SUFFIX}, 1 ${MILLISECOND_SUFFIX}`);
    });
    it(`Will parse ${MILLISECOND_SUFFIX} a string containing milliseconds and hours`, (): void => {
      expect(formatDuration(ONE_HOUR + ONE_MILLISECOND))
        .to.equal(`1 ${HOUR_SUFFIX}, 1 ${MILLISECOND_SUFFIX}`);
    });
    it('Will pars ms into a string containing hours and minutes', (): void => {
      expect(formatDuration(ONE_HOUR + ONE_MINUTE))
        .to.equal(`1 ${HOUR_SUFFIX}, 1 ${MINUTE_SUFFIX}`);
    });
    it(`Will parse ${MILLISECOND_SUFFIX} a string containing minutes, hours and seconds`, (): void => {
      expect(formatDuration(ONE_HOUR + ONE_MINUTE + ONE_SECOND))
        .to.equal(`1 ${HOUR_SUFFIX}, 1 ${MINUTE_SUFFIX}, 1 ${SECOND_SUFFIX}`);
    });
    it(`Will parse ${MILLISECOND_SUFFIX} into a string containing minutes, seconds and milliseconds`, (): void => {
      expect(formatDuration(ONE_MINUTE + ONE_SECOND + ONE_MILLISECOND))
        .to.equal(`1 ${MINUTE_SUFFIX}, 1 ${SECOND_SUFFIX}, 1 ${MILLISECOND_SUFFIX}`);
    });
    it(`Will parse ${MILLISECOND_SUFFIX} into a string containing minutes, hour, seconds and milliseconds`, (): void => {
      expect(formatDuration(ONE_HOUR + ONE_MINUTE + ONE_SECOND + ONE_MILLISECOND))
        .to.equal(`1 ${HOUR_SUFFIX}, 1 ${MINUTE_SUFFIX}, 1 ${SECOND_SUFFIX}, 1 ${MILLISECOND_SUFFIX}`);
    });
  });
  describe('removeFileName', (): void => {
    it('Will remove a file name from the end of a path', (): void => {
      const path = '/some/path/to/file.html';
      const expected = '/some/path/to';
      expect(removeFileName(path)).to.equal(expected);
    });
  });
  describe('getAmountOfExcess', (): void => {
    const secondsInAMinute = ONE_MINUTE / ONE_SECOND;
    const offset = 20;

    it('will return the amount of a time period that may fit into a larger period', (): void => {
      expect(getAmountOfExcess(ONE_MINUTE, ONE_SECOND)).to.eql([secondsInAMinute, 0]);
    });
    it('Calculates a correct remainder of milliseconds if it goes over a time span', (): void => {
      expect(getAmountOfExcess(ONE_MINUTE + offset, ONE_SECOND)).to.eql([secondsInAMinute, offset]);
    });
  });
  describe('buildStringOfTruthyValues', (): void => {
    const hello = 'hello';
    const world = 'world';
    const expected = `${hello}, ${world}`;

    it('Will add a list of values to a string', (): void => {
      expect(buildStringOfTruthyValues(hello, world)).to.equal(expected);
    });
    it('Will omit any falsy values', (): void => {
      expect(buildStringOfTruthyValues(hello, undefined, false, 0, world))
        .to.equal(expected);
    });
    it('Will ignore empty strings', (): void => {
      expect(buildStringOfTruthyValues(hello, '', world)).to.equal(expected);
    });
  });
});
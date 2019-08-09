import { expect } from 'chai';
import {
  roundToTheNearestTenth,
  convertDateStringToMilliseconds,
  convertMillisecondsToDate,
  getMonthDayYearFromDate,
  formatDuration,
  getAmountOfExcess,
  millisecondsToHumanReadable,
  millisecondsToRoundedHumanReadable, buildStringOfTruthyValues,
} from '../../../src/formatting/time';
import {
  HOUR_SUFFIX,
  MILLISECOND_SUFFIX,
  MINUTE_SUFFIX,
  ONE_HOUR, ONE_MILLISECOND,
  ONE_MINUTE,
  ONE_SECOND,
  SECOND_SUFFIX,
} from '../../../src/constants/constants';

describe('time', (): void => {
  const dateString = 'August 13, 1987 23:15:30';
  describe('roundToNearestTenth', (): void => {
    it('Will round a number to the nearest tenth', (): void => {
      expect(roundToTheNearestTenth(12.56)).to.equal(12.6);
    });
  });
  describe('convertMillisecondsToDate', (): void => {
    it('Will get convert and epoch back to it\'s original date', (): void => {
      const date = new Date();
      expect(convertMillisecondsToDate(date.getTime()).toDateString())
        .to.equal(date.toDateString());
    });
  });
  describe('convertDateStringToMilliseconds', (): void => {
    const milliseconds = new Date(dateString).getTime();
    it(`Will convert the date ${dateString} to it's millisecond equivalent ${milliseconds}`, (): void => {
      expect(convertDateStringToMilliseconds(dateString))
        .to.equal(milliseconds);
    });
  });
  describe('getMonthDayYearFromDate', (): void => {
    const monthDayYearString = '8/13/1987';
    it('Will get a human readable version of the date with ', (): void => {
      expect(getMonthDayYearFromDate(new Date(dateString)))
        .to.eql(monthDayYearString);
    });
  });
  describe('formatDuration', (): void => {
    it(`Will return '${MILLISECOND_SUFFIX} when the duration is zero`, (): void => {
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
    it('Will parse ms into a string containing hours and minutes', (): void => {
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
  describe('millisecondsToHumanReadable', (): void => {
    it('Will convert milliseconds to a human readable representation of time', (): void => {
      expect(millisecondsToHumanReadable(3661500)).to.equal('1 h, 1 m, 1 s, 500 ms');
    });
  });
  describe('millisecondsToRoundedHumanReadable', (): void => {
    it('Converts 0 milliseconds to "0 ms"', (): void => {
      expect(millisecondsToRoundedHumanReadable(0)).to.equal('0 ms');
    });
    it('Converts 0.4 to 0.4 ms', (): void => {
      expect(millisecondsToRoundedHumanReadable(0.4)).to.equal('0.4 ms');
    });
    it('Converts milliseconds to an abbreviated human readable string of milliseconds', (): void => {
      expect(millisecondsToRoundedHumanReadable(400)).to.equal('400 ms');
    });
    it('Converts milliseconds to an abbreviated string of seconds', (): void => {
      expect(millisecondsToRoundedHumanReadable(1200)).to.equal('1.2 s');
    });
    it('Converts milliseconds to an abbreviated string for minutes', (): void => {
      expect(millisecondsToRoundedHumanReadable(66000)).to.equal('1.1 m');
    });
    it('Converts milliseconds to an abbreviated string for hours', (): void => {
      expect(millisecondsToRoundedHumanReadable(3661500)).to.equal('1 h');
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

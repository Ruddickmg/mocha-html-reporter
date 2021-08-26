import {
  EMPTY_STRING,
  HOUR_SUFFIX, MILLISECOND_SUFFIX,
  MINUTE_SUFFIX,
  ONE_HOUR,
  ONE_MILLISECOND,
  ONE_MINUTE,
  ONE_SECOND,
  SECOND_SUFFIX,
} from '../constants';

const { floor } = Math;

const timeRanges = [
  ONE_HOUR,
  ONE_MINUTE,
  ONE_SECOND,
  ONE_MILLISECOND,
];

const suffixes = [HOUR_SUFFIX, MINUTE_SUFFIX, SECOND_SUFFIX, MILLISECOND_SUFFIX];
const { round } = Math;

export const getAmountOfExcess = (
  totalTime: number,
  timeSpan: number,
): number[] => [floor(totalTime / timeSpan), totalTime % timeSpan];

export const roundToTheNearestTenth = (amount: number): number => round(amount * 10) / 10;

export const buildStringOfTruthyValues = (
  ...values: any[]
): string => {
  const [first, ...rest] = values
    .filter((value: string): boolean => (
      value
      && value !== EMPTY_STRING
      && value !== '0'
    ));
  return rest
    .reduce((
      previous: string,
      value: string,
    ): string => `${previous}, ${value}`, first || EMPTY_STRING);
};

export const millisecondsToHumanReadable = (totalMilliseconds: number): string => {
  const [times] = timeRanges
    .reduce((
      [time, milliseconds]: any,
      comparison: number,
    ) => {
      const [total, remainder] = getAmountOfExcess(milliseconds, comparison);
      return milliseconds < comparison
        ? [[...time, false], milliseconds]
        : [[...time, total], remainder];
    }, [[], totalMilliseconds]);
  const [hours, minutes, seconds, milliseconds] = times;
  const humanReadable = buildStringOfTruthyValues(
    hours && `${hours} ${HOUR_SUFFIX}`,
    minutes && `${minutes} ${MINUTE_SUFFIX}`,
    seconds && `${seconds} ${SECOND_SUFFIX}`,
    milliseconds && `${milliseconds} ${MILLISECOND_SUFFIX}`,
  );

  return humanReadable === EMPTY_STRING
    ? '0 ms'
    : humanReadable;
};

export const millisecondsToRoundedHumanReadable = (input: number): string => {
  const milliseconds = Number(input);
  const timeRangeIndex = timeRanges
    .filter((timeRange: number): boolean => milliseconds < timeRange)
    .length;
  const suffix = suffixes[timeRangeIndex] || MILLISECOND_SUFFIX;
  const timeRange = timeRanges[timeRangeIndex] || ONE_MILLISECOND;
  return milliseconds
    ? `${roundToTheNearestTenth(milliseconds / timeRange)} ${suffix}`
    : '0 ms';
};

export const convertMillisecondsToDate = (milliseconds: number): Date => {
  const date = new Date(0);
  date.setMilliseconds(milliseconds);
  return date;
};

export const removeTimeZoneOffset = (date: Date): Date => {
  date.setTime(date.getTime() - (date.getTimezoneOffset() * ONE_MINUTE));
  return date;
};

export const convertDateStringToMilliseconds = (
  dateString: string,
): number => removeTimeZoneOffset(new Date(dateString)).getTime();

export const getMonthDayYearFromDate = (
  date: Date,
): string => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

export const formatDuration = (
  duration: number,
): string => millisecondsToHumanReadable(duration);

import path from 'path';
import {
  EMPTY_STRING,
  HOUR_SUFFIX,
  MILLISECOND_SUFFIX,
  MINUTE_SUFFIX,
  ONE_HOUR,
  ONE_MILLISECOND,
  ONE_MINUTE,
  ONE_SECOND,
  PATH_SEPARATOR, SECOND_SUFFIX,
} from "../utilities/constants";
import {Test} from "mocha";
import {TestResult} from "../report/eventHandlers";

const floor = Math.floor;

export interface ExpectedOptions {
  outputDir?: string;
  testDir?: string;
  fileName?: string;
  screenShotEachTest?: boolean;
  screenShotOnFailure?: boolean,
}

export interface Environment {
  reporterOptions: ExpectedOptions;
}

export const formatTestResults = (
  {
    title,
    duration,
  }: Test,
  image?: string,
): TestResult =>  ({
  title,
  duration: formatDuration(duration),
  ...(!!image && { image }),
});

export const formatOutputFilePath = (
  outputDir: string,
  fileName: string,
): string => `${path.resolve(process.cwd(), outputDir)}${PATH_SEPARATOR}${fileName}.html`;

export const getCommandLineOptions = (
  environment?: Environment,
): ExpectedOptions => (environment && environment.reporterOptions) || {};

export const removeFileName = (pathToFile: string): string => {
  const fileName = pathToFile.split(PATH_SEPARATOR).pop();
  const toRemove = `${PATH_SEPARATOR}${fileName}`;
  return pathToFile.replace(toRemove, EMPTY_STRING);
};

export const getAmountOfExcess = (
  totalTime: number,
  timeSpan: number,
  ): number[] => [floor(totalTime / timeSpan), totalTime % timeSpan];

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
  const [times] = [
    ONE_HOUR,
    ONE_MINUTE,
    ONE_SECOND,
    ONE_MILLISECOND,
  ]
    .reduce((
      [time, milliseconds]: any,
      comparison: number,
      index: number,
    ) => {
      let remaining = milliseconds;
      if (milliseconds >= comparison) {
        const [total, remainder] = getAmountOfExcess(milliseconds, comparison);
        remaining = remainder;
        time[index] = total;
      }
      return [time, remaining];
    }, [[], totalMilliseconds]);
  const [ hours, minutes, seconds, milliseconds ] = times;
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

export const formatDuration = (duration: number): string => millisecondsToHumanReadable(duration);

import { resolve } from 'path';
import uuid from 'uuid/v1';
import { Test } from 'mocha';
import {
  EMPTY_STRING,
  HOUR_SUFFIX,
  MILLISECOND_SUFFIX,
  MINUTE_SUFFIX,
  ONE_HOUR,
  ONE_MILLISECOND,
  ONE_MINUTE,
  ONE_SECOND,
  PATH_SEPARATOR,
  SECOND_SUFFIX,
} from '../constants/constants';
import { getFilePath, getParentPath } from './path';
import { TestResult } from '../report/eventHandlers';

const { floor } = Math;

export interface ExpectedOptions {
  outputDir?: string;
  testDir?: string;
  fileName?: string;
  screenShotEachTest?: boolean;
  screenShotOnFailure?: boolean;
}

export interface Environment {
  reporterOptions: ExpectedOptions;
}

interface SuiteIds {
  [suite: string]: string;
}

export type TestResultFormatter = (test: Test, image?: string) => TestResult;

export const createTestResultFormatter = (
  pathToTestDirectory: string,
): TestResultFormatter => {
  const suiteIds: SuiteIds = {};
  return (
    test: Test,
    image?: string,
  ): TestResult => {
    const {
      title,
      parent,
      duration,
      file,
    } = test;
    const suite = parent.title;
    const suiteId = suiteIds[suite] || uuid();
    suiteIds[suite] = suiteId;
    return {
      id: uuid(),
      title,
      suite,
      suiteId,
      duration: formatDuration(duration),
      path: file
        ? getFilePath(file, pathToTestDirectory)
        : getParentPath(test),
      ...(!!image && { image }),
    } as TestResult;
  };
};

export const formatOutputPath = (
  outputDir: string,
): string => `${resolve(process.cwd(), outputDir)}${PATH_SEPARATOR}`;

export const formatOutputFilePath = (
  outputDir: string,
  fileName: string,
): string => `${formatOutputPath(outputDir)}${fileName}.html`;

export const formatHistoryOutputPath = (
  outputDir: string,
  fileName: string,
): string => `${formatOutputPath(outputDir)}${fileName}.history`;

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

export const convertMillisecondsToDate = (milliseconds: number): Date => {
  const date = new Date(0);
  date.setMilliseconds(milliseconds);
  date.setHours(date.getHours() + 1);
  return date;
};

export const convertDateStringToMilliseconds = (dateString: string): number => (new Date(dateString)).getTime();

export const getMonthDayYearFromDate = (date: Date): string => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

export const formatDuration = (duration: number): string => millisecondsToHumanReadable(duration);

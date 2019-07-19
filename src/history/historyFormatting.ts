import { TestResult } from "../report/eventHandlers";

export const convertMillisecondsToDate = (milliseconds: number): Date => {
  const date = new Date(0);
  date.setMilliseconds(milliseconds);
  date.setHours(date.getHours() + 1);
  return date;
};

export const getEachRunDate = (history: TestResult[]): string[] => {
  const dates = history.map(({ date }: TestResult): number => date);
  return [...new Set(dates)]
    .sort((a: number, b: number): number => a - b)
    .map(convertMillisecondsToDate)
    .map((date: Date): string => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`);
};

export const formatHistoryTable = (history: TestResult[]): any => {
  const dates = getEachRunDate(history);
};
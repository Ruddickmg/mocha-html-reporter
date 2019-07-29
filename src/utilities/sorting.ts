import { TestResult } from '../report/eventHandlers';

export const sortNumbersIncrementing = (a: number, b: number): number => a - b;
export const sortNumbersDecrementing = (a: number, b: number): number => b - a;
export const sortTestResultsByDate = (tests: TestResult[]): TestResult[] => tests
  .sort((
    { date: a }: TestResult,
    { date: b }: TestResult,
  ): number => sortNumbersDecrementing(a, b));

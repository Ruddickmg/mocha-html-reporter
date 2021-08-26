import { TestResult } from './html';

export const formatTestResult = ({ duration, state }: TestResult): string => `${state} ${duration}`;

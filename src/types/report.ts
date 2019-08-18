import { Test } from 'mocha';

export interface TestResult {
  duration: number;
  date: number;
  id: string;
  image?: string;
  path: string[];
  class?: string;
  suite: string;
  state: string;
  suiteId: string;
  title: string;
}

export interface Content {
  [name: string]: string;
}

export interface TestSuite {
  [directory: string]: TestSuite | TestResult[] | Content | string;
}

export interface HistoryByDate {
  [date: string]: TestResult[];
}

export interface TestResultsBySuite {
  [suite: string]: TestResult;
}

export interface HistoryBySuite {
  [suiteName: string]: TestResult[];
}

export interface ReportData {
  pathToOutputFile: string;
  timeOfTest: number;
  pageTitle: string;
  styles: string;
  scripts: string;
  history: HistoryByDate;
}
export type TestHandler = (
  test?: Test,
  error?: Error,
) => Promise<void>;

export interface TestHandlers {
  [handlerName: string]: TestHandler;
}

export type TestHandlerFactory = (
  state: string,
  captureScreen: boolean,
) => TestHandler;

export interface ReportInput {
  data: string;
  styles: string;
  scripts: string;
  pageTitle: string;
}

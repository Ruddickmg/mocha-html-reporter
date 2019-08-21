import { Test } from 'mocha';
import { TestResult } from './report';

export interface FilesToIgnore {
  [fileName: string]: boolean;
}

export interface CodeStore {
  [identifier: string]: string;
}

export interface FileCodeMappings {
  [filename: string]: CodeStore;
}

export interface SuiteIds {
  [suite: string]: string;
}

export type TestResultFormatter = (test: Test, image?: string) => TestResult;

export type NameGenerator = (...args: any[]) => string;

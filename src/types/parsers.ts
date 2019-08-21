export interface Symbols {
  [symbolName: string]: string;
}

export interface ParseTree {
  [symbol: string]: ParseTree | string;
}

export type Parser = (char: string) => string | boolean;

export interface ExpectedOptions {
  reporter?: string;
  historyDir?: string;
  outputDir?: string;
  testDir?: string;
  fileName?: string;
  screenShotEachTest?: boolean;
  screenShotOnFailure?: boolean;
}

export interface Environment {
  reporterOptions: ExpectedOptions;
}

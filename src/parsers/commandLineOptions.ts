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

export const getCommandLineOptions = (
  environment?: Environment,
): ExpectedOptions => (environment && environment.reporterOptions) || {};

export interface ExpectedOptions {
  reporter?: string;
  // TODO remove testDir, should be detectable
  testDir?: string;
  outputFile?: string;
  screenShotEachTest?: boolean;
  screenShotOnFailure?: boolean;
}

export interface Environment {
  reporterOptions: ExpectedOptions;
}

export const getCommandLineOptions = (
  environment?: Environment,
): ExpectedOptions => (environment && environment.reporterOptions) || {};

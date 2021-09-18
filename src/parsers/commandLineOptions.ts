export interface ExpectedOptions {
  reporter?: string;
  // TODO remove testDir, should be detectable
  testDir?: string;
  // TODO combine fileName and outputDir
  fileName?: string;
  outputDir?: string;
  screenShotEachTest?: boolean;
  screenShotOnFailure?: boolean;
}

export interface Environment {
  reporterOptions: ExpectedOptions;
}

export const getCommandLineOptions = (
  environment?: Environment,
): ExpectedOptions => (environment && environment.reporterOptions) || {};

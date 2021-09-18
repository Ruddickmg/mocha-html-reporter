export interface ExpectedOptions {
  reporter?: string;
  outputFile?: string;
  screenShotEachTest?: boolean;
  screenShotOnFailure?: boolean;
}

export interface Environment {
  reporterOptions: ExpectedOptions;
  files: string[];
}

export const getCommandLineOptions = (
  environment?: Environment,
): ExpectedOptions => (environment && environment.reporterOptions) || {};

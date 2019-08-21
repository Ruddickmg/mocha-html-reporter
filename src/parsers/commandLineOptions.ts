import { Environment, ExpectedOptions } from '../types/parsers';

export const getCommandLineOptions = (
  environment?: Environment,
): ExpectedOptions => (environment && environment.reporterOptions) || {};

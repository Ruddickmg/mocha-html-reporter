import { reporters, Runner } from 'mocha';
import { Environment } from './parsers/formatting';
import { reportGenerator } from './report/reportGenerator';
import { capitalizeFirstLetter } from './utilities/strings';
import { logError } from './utilities/logging';

interface Reporters {
  [reporterName: string]: any;
}

export function mochaHtmlReporter(runner: Runner, options: Environment): void {
  const consoleReporter = capitalizeFirstLetter(options.reporterOptions.consoleReporter);
  const {
    Base,
    [consoleReporter]: Reporter,
  }: Reporters = reporters;
  reportGenerator(runner, options)
    .catch((error: Error): void => logError('Something went wrong with the report generator', error));
  Base.call(this, runner, options);
  if (Reporter) {
    // eslint-disable-next-line no-new
    new Reporter(runner);
  }
}

module.exports = mochaHtmlReporter;

import { reporters, Runner } from 'mocha';
import { Environment } from './parsers/commandLineOptions';
import { reportGenerator } from './report/reportGenerator';
import { capitalizeFirstLetter } from './utilities/strings';
import { logError } from './utilities/logging';

interface Reporters {
  [reporterName: string]: any;
}

export function mochaHtmlReporter(runner: Runner, options: Environment): void {
  const consoleReporter = capitalizeFirstLetter(options.reporterOptions.reporter);
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
export { FAILED } from './scripts/constants';
export { PASSED } from './scripts/constants';
export { ONE_HOUR } from './scripts/constants';
export { ONE_MINUTE } from './scripts/constants';
export { ONE_SECOND } from './scripts/constants';
export { ONE_MILLISECOND } from './scripts/constants';
export { HOUR_SUFFIX } from './scripts/constants';
export { MINUTE_SUFFIX } from './scripts/constants';
export { SECOND_SUFFIX } from './scripts/constants';
export { MILLISECOND_SUFFIX } from './scripts/constants';
export { EMPTY_STRING } from './scripts/constants';

import { reporters, Runner } from 'mocha';
import { Environment } from './parsers/formatting';
import { reportGenerator } from './report/reportGenerator';

export function mochaHtmlReporter(runner: Runner, options: Environment): void {
  const { Base, Spec } = reporters;
  reportGenerator(runner, options)
    .catch((error: Error): void => console.log('Something went wrong with the report generator', error));
  Base.call(this, runner);
  // eslint-disable-next-line no-new
  new Spec(runner);
}

module.exports = mochaHtmlReporter;

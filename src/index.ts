import { reporters, Runner } from 'mocha';
import { Environment } from './parsers/formatting';
import { reportGenerator } from './report/reportGenerator';

export function mochaHtmlReporter(runner: Runner, options: Environment): void {
  reportGenerator(runner, options)
    .catch((error: Error): void => console.log('Something went wrong with the report generator', error));
  reporters.Base.call(this, runner);
}

export default mochaHtmlReporter;

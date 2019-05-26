import { Environment } from './parsers/formatting';
import { reporters, Runner } from 'mocha';
import reportGenerator from "./report/reportGenerator";

export default function MochaHtmlReporter(runner: Runner, options: Environment) {
  reportGenerator(runner, options)
    .catch((error: Error): void => console.log('Something went wrong with the report generator', error));
  reporters.Base.call(this, runner);
};

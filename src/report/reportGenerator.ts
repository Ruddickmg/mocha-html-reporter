import { Runner } from 'mocha';
import { getStyles } from '../parsers/styles';
import {
  createReportHandler,
  createTestHandler,
  setTestEventHandlers,
  TestHandlers,
  TestResult,
} from './eventHandlers';
import {
  FAIL,
  FINISHED,
  PASS,
  PATH_TO_SCRIPTS,
  PATH_TO_STYLE_SHEET,
} from '../constants/constants';
import { Environment, formatOutputFilePath, getCommandLineOptions } from '../parsers/formatting';
import { generateTestResultsBySuite } from '../parsers/testSuite';
import { getHistory } from '../history/storage';
import { compileCode } from '../utilities/compiler';
import { variableNameGenerator } from '../../test/helpers/expectations';

export const reportGenerator = async (
  runner: Runner,
  environment: Environment,
): Promise<void> => {
  const tests: TestResult[] = [];
  const {
    screenShotEachTest,
    screenShotOnFailure,
    testDir,
    outputDir,
    fileName,
  } = getCommandLineOptions(environment);
  const timeOfTest = Date.now();
  const pathToOutputFile = formatOutputFilePath(outputDir, fileName);
  const styles = getStyles(PATH_TO_STYLE_SHEET);
  const history = getHistory(pathToOutputFile);
  const scripts = compileCode(PATH_TO_SCRIPTS, variableNameGenerator());
  const takeScreenShotOnFailure = screenShotOnFailure || screenShotEachTest;
  const reportData = {
    reportTitle: 'test title',
    pageTitle: 'This is a test',
    styles,
    scripts,
    history,
  };

  const handlers: TestHandlers = {
    [FAIL]: createTestHandler(
      tests,
      testDir,
      takeScreenShotOnFailure,
      timeOfTest,
    ),
    [PASS]: createTestHandler(
      tests,
      testDir,
      screenShotEachTest,
      timeOfTest,
    ),
    [FINISHED]: createReportHandler(
      tests,
      pathToOutputFile,
      reportData,
      generateTestResultsBySuite,
    ),
  };

  setTestEventHandlers(runner, handlers);
};

export default reportGenerator;

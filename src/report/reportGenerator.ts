import { Runner } from 'mocha';
import { getStyles } from './styles';
import {
  createReportHandler,
  createTestHandler,
  setTestEventHandlers,
  TestHandlers,
  TestResult,
} from './eventHandlers';
import {
  FAILED,
  FINISHED,
  PASSED,
  PATH_TO_SCRIPTS,
  PATH_TO_STYLE_SHEET,
} from '../constants/constants';
import { Environment, getCommandLineOptions } from '../parsers/commandLineOptions';
import { generateTestResultsBySuite } from '../formatting/testSuite';
import { getHistory } from '../history/storage';
import { compileCode } from '../scripts/compiler';
import { variableNameGenerator } from '../../test/helpers/expectations';
import { formatOutputFilePath } from '../formatting/paths';

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
    [FAILED]: createTestHandler(
      tests,
      testDir,
      takeScreenShotOnFailure,
      timeOfTest,
      FAILED,
    ),
    [PASSED]: createTestHandler(
      tests,
      testDir,
      screenShotEachTest,
      timeOfTest,
      PASSED,
    ),
    // TODO pass statistic/suite data through report handler, counts etc from test handler
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

import { Runner } from 'mocha';
import { getStyles } from './styles';
import {
  createReportHandler,
  createTestHandler,
  setTestEventHandlers,
  TestHandlers,
} from './eventHandlers';
import {
  DEFAULT_OUTPUT_FILE,
  FINISHED,
  PATH_TO_SCRIPTS,
  PATH_TO_STYLE_SHEET,
} from '../constants';
import { Environment, getCommandLineOptions } from '../parsers/commandLineOptions';
import { compileCode } from '../compilation';
import { getHistory } from '../utilities/fileSystem';
import { variableNameGenerator } from '../../test/helpers/expectations';
import { TEST_FAILED, TEST_PASSED } from '../constants/mocha';
import { FAILED, PASSED } from '../scripts/constants';
import { TestResult } from '../scripts/formatting/html';
import { getCommonRoot } from '../parsers/path';

export const reportGenerator = async (
  runner: Runner,
  environment: Environment,
): Promise<void> => {
  const tests: TestResult[] = [];
  const {
    screenShotEachTest,
    screenShotOnFailure,
    outputFile,
  } = getCommandLineOptions(environment);
  const testDir = getCommonRoot(environment.files);
  const timeOfTest = Date.now();
  const pathToOutputFile = outputFile || DEFAULT_OUTPUT_FILE;
  const styles = await getStyles(PATH_TO_STYLE_SHEET);
  const history = await getHistory(pathToOutputFile);
  const scripts = await compileCode(PATH_TO_SCRIPTS, variableNameGenerator());
  const takeScreenShotOnFailure = screenShotOnFailure || screenShotEachTest;
  const reportData = {
    reportTitle: 'test title',
    pageTitle: 'This is a test',
    styles,
    scripts,
    history,
  };

  const handlers: TestHandlers = {
    [TEST_FAILED]: createTestHandler(
      tests,
      testDir,
      takeScreenShotOnFailure,
      timeOfTest,
      FAILED,
    ),
    [TEST_PASSED]: createTestHandler(
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
    ),
  };

  setTestEventHandlers(runner, handlers);
};

export default reportGenerator;

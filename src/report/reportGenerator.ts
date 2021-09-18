import { Runner } from 'mocha';
import { getStyles } from './styles';
import {
  createReportHandler,
  createTestHandler,
  setTestEventHandlers,
  TestHandlers,
} from './eventHandlers';
import {
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

export const reportGenerator = async (
  runner: Runner,
  environment: Environment,
): Promise<void> => {
  const tests: TestResult[] = [];
  const {
    screenShotEachTest,
    screenShotOnFailure,
    testDir,
    outputFile,
  } = getCommandLineOptions(environment);
  const timeOfTest = Date.now();
  const styles = await getStyles(PATH_TO_STYLE_SHEET);
  const history = await getHistory(outputFile);
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
      outputFile,
      reportData,
    ),
  };

  setTestEventHandlers(runner, handlers);
};

export default reportGenerator;

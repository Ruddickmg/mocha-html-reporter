import { Runner } from 'mocha';
import { existsSync } from 'fs';
import { getStyles } from './styles';
import {
  FAILED,
  PASSED,
  PATH_TO_SCRIPTS,
  PATH_TO_STYLE_SHEET,
} from '../constants/constants';
import { Environment, getCommandLineOptions } from '../parsers/commandLineOptions';
import { getScripts } from '../scripts/compiler';
import { getHistory, writeToFile } from '../utilities/fileSystem';
import { formatOutputFilePath } from '../formatting/paths';
import { TEST_FAILED, TEST_PASSED } from '../constants/mocha';
import {
  createTestHandler,
  handleMochaEvents,
  TestResult,
  TestHandlers,
} from './eventHandlers';
import { reportTemplate } from '../templates/report.html';

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
  const styles = await getStyles(PATH_TO_STYLE_SHEET);
  const scripts = await getScripts(PATH_TO_SCRIPTS);
  const history = await getHistory(pathToOutputFile) || {};
  const takeScreenShotOnFailure = screenShotOnFailure || screenShotEachTest;
  const reportData = {
    reportTitle: 'test title',
    pageTitle: 'This is a test',
    data: JSON.stringify(history),
    styles,
    scripts,
  };

  if (!existsSync(pathToOutputFile)) {
    await writeToFile(pathToOutputFile, reportTemplate(reportData));
  }

  const handlers: TestHandlers = {
    [TEST_FAILED]: createTestHandler(
      tests,
      history,
      testDir,
      timeOfTest,
      FAILED,
      takeScreenShotOnFailure,
    ),
    [TEST_PASSED]: createTestHandler(
      tests,
      history,
      testDir,
      timeOfTest,
      PASSED,
      screenShotEachTest,
    ),
  };

  handleMochaEvents(runner, handlers);
};

export default reportGenerator;

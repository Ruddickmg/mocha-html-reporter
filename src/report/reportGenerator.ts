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
  TestHandlers, ReportData,
} from './eventHandlers';
import { ReportInput, reportTemplate } from '../templates/report.html';

export const reportGenerator = async (
  runner: Runner,
  environment: Environment,
): Promise<void> => {
  const tests: TestResult[] = [];
  const {
    screenShotEachTest,
    screenShotOnFailure,
    outputDir,
    fileName,
  } = getCommandLineOptions(environment);
  const timeOfTest = Date.now();
  const pathToOutputFile = formatOutputFilePath(outputDir, fileName);
  const takeScreenShotOnFailure = screenShotOnFailure || screenShotEachTest;
  const styles = await getStyles(PATH_TO_STYLE_SHEET);
  const scripts = await getScripts(PATH_TO_SCRIPTS);
  const history = await getHistory(pathToOutputFile) || {};

  const reportInput: ReportInput = {
    pageTitle: 'This is a test',
    styles,
    scripts,
    data: JSON.stringify(history),
  };
  const reportData: ReportData = {
    ...reportInput,
    pathToOutputFile,
    history,
    timeOfTest,
  };

  if (!existsSync(pathToOutputFile)) {
    await writeToFile(
      pathToOutputFile,
      reportTemplate(reportInput),
    );
  }

  const handlers: TestHandlers = {
    [TEST_FAILED]: createTestHandler(
      tests,
      FAILED,
      takeScreenShotOnFailure,
      reportData,
    ),
    [TEST_PASSED]: createTestHandler(
      tests,
      PASSED,
      screenShotEachTest,
      reportData,
    ),
  };

  handleMochaEvents(runner, handlers);
};

export default reportGenerator;

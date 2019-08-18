import { Runner } from 'mocha';
import { existsSync } from 'fs';
import { getStyles } from './styles';
import { Environment, getCommandLineOptions } from '../parsers/commandLineOptions';
import { getScripts } from '../formatting/scriptCompiler';
import { getHistory, writeToFile } from '../utilities/fileSystem';
import { formatOutputFilePath } from '../formatting/paths';
import { TEST_FAILED, TEST_PASSED } from '../constants/mocha';
import { handleMochaEvents, initializeTestHandlerFactory } from './eventHandlers';
import { reportTemplate } from './reportTemplate';
import {
  ReportData,
  ReportInput,
  TestHandlerFactory,
  TestHandlers,
  TestResult,
} from '../types/report';
import { PATH_TO_SCRIPTS, PATH_TO_STYLE_SHEET } from '../constants/fileSystem';

export const reportGenerator = async (
  runner: Runner,
  environment: Environment,
): Promise<void> => {
  const {
    screenShotEachTest,
    screenShotOnFailure,
    outputDir,
    fileName,
  } = getCommandLineOptions(environment);
  const timeOfTest = Date.now();
  const tests: TestResult[] = [];
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
  const createTestHandler: TestHandlerFactory = initializeTestHandlerFactory(
    tests,
    reportData,
  );

  if (!existsSync(pathToOutputFile)) {
    await writeToFile(
      pathToOutputFile,
      reportTemplate(reportInput),
    );
  }

  const handlers: TestHandlers = {
    [TEST_FAILED]: createTestHandler(
      TEST_FAILED,
      takeScreenShotOnFailure,
    ),
    [TEST_PASSED]: createTestHandler(
      TEST_PASSED,
      screenShotEachTest,
    ),
  };

  handleMochaEvents(runner, handlers);
};

export default reportGenerator;

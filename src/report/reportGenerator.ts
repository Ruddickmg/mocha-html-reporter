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
  PATH_TO_STYLE_SHEET,
} from '../constants/constants';
import { Runner } from 'mocha';
import {
  Environment, formatHistoryOutputPath,
  formatOutputFilePath,
  getCommandLineOptions,
} from '../parsers/formatting';
import { getTemplates } from '../templates/all';
import { getHistory } from "../history/storage";
import { generateTestResultsBySuite } from "../parsers/testSuite";

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
  const pathToOutputFile = formatOutputFilePath(outputDir, fileName);
  const pathToHistoryOutput = formatHistoryOutputPath(outputDir, fileName);
  const styles = await getStyles(PATH_TO_STYLE_SHEET);
  const history = await getHistory(pathToHistoryOutput);
  const templates = getTemplates();
  const takeScreenShotOnFailure = screenShotOnFailure || screenShotEachTest;
  const reportData = {
    reportTitle: 'test title',
    pageTitle: 'This is a test',
    styles,
  };

  const handlers: TestHandlers = {
    [FAIL]: createTestHandler(
      tests,
      testDir,
      takeScreenShotOnFailure,
    ),
    [PASS]: createTestHandler(
      tests,
      testDir,
      screenShotEachTest,
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

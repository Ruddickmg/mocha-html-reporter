import {getStyles} from "./styles";
import {createReportHandler, createTestHandler, setTestEventHandlers, TestHandlers} from "./eventHandlers";
import {FAIL, FINISHED, PASS, PATH_TO_STYLE_SHEET} from "../utilities/constants";
import {Runner} from "mocha";
import {Environment, formatOutputFilePath, getCommandLineOptions} from "../parsers/formatting";
import {getTemplates} from "../parsers/templating";

export default async (
  runner: Runner,
  environment: Environment,
): Promise<void> => {
  const testSuite = {};
  const {
    screenShotEachTest,
    screenShotOnFailure,
    testDir,
    outputDir,
    fileName,
  } = getCommandLineOptions(environment);
  const styles = await getStyles(PATH_TO_STYLE_SHEET);
  const templates = await getTemplates();
  const takeScreenShotOnFailure = screenShotOnFailure || screenShotEachTest;
  const pathToOutputFile = formatOutputFilePath(outputDir, fileName);
  const reportData = {
    reportTitle: 'test title',
    pageTitle: 'This is a test',
    styles,
  };

  const handlers: TestHandlers = {
    [FAIL]: createTestHandler(testSuite, testDir, takeScreenShotOnFailure),
    [PASS]: createTestHandler(testSuite, testDir, screenShotEachTest),
    [FINISHED]: createReportHandler(testSuite, pathToOutputFile, reportData, templates),
  };

  setTestEventHandlers(runner, handlers);
};
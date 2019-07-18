import { readdir } from 'fs';
import { getFileContents } from "../utilities/fileSystem";
import { TestResult } from "./eventHandlers";
import { PATH_SEPARATOR } from "../constants/index";

export const getHistory = (
  pathToHistoryDir: string,
): Promise<TestResult[]> => new Promise((resolve, reject): any => readdir(
  pathToHistoryDir,
  async (error, files): Promise<void> => {
    if (error) {
      reject(error);
    }
    resolve(
      (await Promise.all(files.map(
        (
          fileName: string
        ): Promise<any> => getFileContents(`${pathToHistoryDir}${PATH_SEPARATOR}${fileName}`),
      )))
        .reduce((
          history: TestResult[],
          contents: string,
        ): TestResult[] => [
          ...history,
          ...JSON.parse(contents),
        ], [] as TestResult[])
    );
  },
));

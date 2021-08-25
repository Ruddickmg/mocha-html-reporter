import { getFileContents } from '../utilities/fileSystem';
import { getFilePath, removeFileNameFromPath } from './utilities';
import { IMPORT_DECLARATION, NEW_LINE } from '../constants';
import { CodeStore, FilesToIgnore } from './index';

export const getCodeByPath = async (file: string): Promise<CodeStore> => {
  const importedPaths: FilesToIgnore = {};
  const getFileToCodeMappings = async (fileName: string): Promise<CodeStore> => {
    const code = await getFileContents(fileName);
    const pathToFile = removeFileNameFromPath(fileName);
    const paths = [];
    const lines = code.split(NEW_LINE);
    let lineIndex = lines.length;
    importedPaths[fileName] = true;
    // eslint-disable-next-line no-plusplus
    while (lineIndex--) {
      const line = lines[lineIndex];
      if (line.includes(IMPORT_DECLARATION)) {
        const path = getFilePath(pathToFile, line);
        if (!importedPaths[path]) {
          importedPaths[path] = true;
          paths.push(path);
        }
      }
    }
    return (await paths
      .reduce(async (
        allCode: Promise<CodeStore>,
        path: string,
      ): Promise<CodeStore> => ({
        ...await getFileToCodeMappings(path),
        ...await allCode,
      }), Promise.resolve({
        [fileName]: code,
      }))) as CodeStore;
  };
  return getFileToCodeMappings(file);
};

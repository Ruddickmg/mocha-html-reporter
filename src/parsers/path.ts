import { Suite, Test } from 'mocha';
import { PATH_SEPARATOR, PERIOD } from '../constants/index';
import { EMPTY_STRING } from '../scripts/constants';

export const getParentPath = (
  { parent, title }: Test | Suite,
): string[] => (parent ? [
  ...getParentPath(parent as Test | Suite),
  title,
] : [title]);

export const getFilePath = (
  path: string,
  ignore?: string,
): string[] => {
  const splitPath = (
    ignore && path.includes(ignore)
      ? path.split(ignore).pop()
      : path
  ).split(PATH_SEPARATOR)
    .filter((directory: string): boolean => directory !== EMPTY_STRING);
  splitPath.pop().split(PERIOD).shift();
  return splitPath;
};

export default {
  getParentPath,
  getFilePath,
};

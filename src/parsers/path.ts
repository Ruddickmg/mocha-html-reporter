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

export const getCommonRoot = ([first, ...files]: string[]): string => files
  .reduce((root: string, current: string): string => {
    let commonRoot = '';
    let i = 0;
    while (root[i] === current[i]) {
      commonRoot += root[i];
      i += 1;
    }
    return commonRoot;
  }, first);

export default {
  getParentPath,
  getFilePath,
};

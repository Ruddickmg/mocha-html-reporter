import { EMPTY_STRING, PATH_SEPARATOR, PERIOD } from '../constants/constants';
import { Test, Suite } from 'mocha';

export const getParentPath = (
  { parent, title }: Test | Suite,
): string[] => parent ? [
  ...getParentPath(parent as Test | Suite),
  title,
] : [title];

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
  return splitPath
};

export default {
  getParentPath,
  getFilePath,
}

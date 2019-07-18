import { EMPTY_STRING, PATH_SEPARATOR } from "../constants";
import { Test, Suite } from 'mocha';

const PERIOD: string = '.';

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
  const fileName = splitPath.pop().split(PERIOD).shift();
  return splitPath
};

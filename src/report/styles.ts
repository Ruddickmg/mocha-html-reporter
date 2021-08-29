import { render, Result } from 'node-sass';
import { minifyCss } from './htmlConversion';

export const getStyles = (
  pathToFile: string,
): Promise<string> => new Promise((resolve, reject): void => render({
  file: pathToFile,
  includePaths: [
    'scss',
    'node_modules',
  ],
}, async (error: Error, result: Result): Promise<void> => {
  try {
    const css = await minifyCss(result.css.toString());
    return error
      ? reject(error)
      : resolve(css.styles);
  } catch (e) {
    return reject(e);
  }
}));

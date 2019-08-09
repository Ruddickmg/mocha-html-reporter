import { render } from 'node-sass';
import { minifyCss } from './htmlConversion';

interface CssResults {
  css: string;
}

export const getStyles = (
  pathToFile: string,
): Promise<string> => new Promise((resolve, reject): string => render({
  file: pathToFile,
  includePaths: [
    'scss',
    'node_modules',
  ],
}, async (error: Error, result: CssResults): Promise<void> => {
  try {
    const css = await minifyCss(result.css.toString());
    return error
      ? reject(error)
      : resolve(css.styles);
  } catch (e) {
    return reject(e);
  }
}));

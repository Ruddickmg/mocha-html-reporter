import { minifyCss } from '../report/htmlConversion';
import { render } from 'node-sass';

export const getStyles = (
  pathToFile: string,
): Promise<string> => new Promise((resolve, reject) => render({
  file: pathToFile,
  includePaths: [
    'scss',
    'node_modules',
  ],
}, async (error: Error, result: any): Promise<void> => {
  try {
    const css = await minifyCss(result.css.toString());
    return error
      ? reject(error)
      : resolve(css.styles);
  } catch (e) {
    return reject(e);
  }
}));

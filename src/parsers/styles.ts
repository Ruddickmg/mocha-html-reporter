const { render } = require('node-sass');
const CleanCSS = require('clean-css');
const cleaner = new CleanCSS({ });

export const getStyles = (
  pathToFile: string,
): Promise<string> => new Promise((resolve, reject) => render({
  file: pathToFile,
  includePaths : [
    'scss',
    'node_modules',
  ],
}, (error: Error, result: any): void => (
  error
    ? reject(error)
    : resolve(cleaner.minify(result.css.toString()).styles)
)));
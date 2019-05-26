const { render } = require('node-sass');

export const getStyles = (pathToFile: string): Promise<string> => render(
  pathToFile,
  {},
);
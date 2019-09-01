import CleanCss from 'clean-css';
import { minify as minifyJavascript } from 'uglify-js';
import { minify } from 'html-minifier';
import { uglifyJsConfiguration } from '../configuraton/uglify-js.config';
import { logError } from '../utilities/logging';
import { cleanCssConfiguration } from '../configuraton/clean-css.config';
import { minifyHtmlConfiguration } from '../configuraton/html-minifier.config';

export const minifyJs = (unMinifiedCode: string): string => {
  console.log('unminified: ', unMinifiedCode, '\n');
  const { code, error } = minifyJavascript(unMinifiedCode, uglifyJsConfiguration);
  if (error) {
    logError('Error in javascript minification,', error);
  }
  return code;
};

export const minifyCss = (css: string): Promise<any> => new CleanCss(cleanCssConfiguration)
  .minify(css)
  .catch((error: Error): void => logError('Error in css minification', error));

export const minifyHtml = (html: string): string => {
  let minifiedHtml = '';
  try {
    minifiedHtml = minify(html, minifyHtmlConfiguration);
  } catch (error) {
    logError('Error in html minification', error);
  }
  return minifiedHtml;
};

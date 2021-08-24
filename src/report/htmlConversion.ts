import CleanCss from 'clean-css';
import { minify as minifyHtml } from 'html-minifier';
import { minify as minifyJavascript } from 'uglify-js';
import { minifyHtmlConfiguration } from '../configuraton/html-minifier.config';
import { clearAllTemplateValues } from '../templates/index';
import { uglifyJsConfiguration } from '../configuraton/uglify-js.config';
import { logError } from '../utilities/logging';
import { cleanCssConfiguration } from '../configuraton/clean-css.config';

export const cleanAndMinifyHtml = (
  html: string,
): string => minifyHtml(clearAllTemplateValues(html), minifyHtmlConfiguration);

export const minifyJs = (prettyCode: string): string => {
  const { code, error } = minifyJavascript(prettyCode, uglifyJsConfiguration);
  if (error) {
    logError('Error in minification,', error);
  }
  return code;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const minifyCss = (css: string): Promise<any> => new CleanCss(cleanCssConfiguration)
  .minify(css);

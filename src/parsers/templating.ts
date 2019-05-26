import {
  IMAGE_TEMPLATE,
  PATH_TO_TEMPLATES, REPORT_TEMPLATE,
  TEMPLATE_BRACES, TEST_RESULT_TEMPLATE, TEST_SUITE_TEMPLATE,
} from '../utilities/constants';
import { getFileContents } from '../utilities/fileSystem';
import {TestResult} from "../report/eventHandlers";

export type TemplatePopulator = (values: TemplateValues) => Promise<string>;

export interface TemplateValues {
  [replaceString: string]: string | number | TestResult[] | TemplateValues;
}

export interface Templates {
  [templateName: string]: string;
}

export const getTemplate = (
  name: string,
): Promise<string> => getFileContents(`${PATH_TO_TEMPLATES}/${name}.html`);

export const getTemplates = (): Promise<Templates> => Promise.all([
  IMAGE_TEMPLATE,
  REPORT_TEMPLATE,
  TEST_RESULT_TEMPLATE,
  TEST_SUITE_TEMPLATE,
].map((name: string): Promise<string> => getTemplate(name)))
  .then(([
    imageTemplate,
    reportTemplate,
    testResultTemplate,
    testSuiteTemplate,
  ]: string[]): Templates => ({
    imageTemplate,
    reportTemplate,
    testResultTemplate,
    testSuiteTemplate,
  }));

export const clearAllTemplateValues = (
  template: string,
): string => template.replace(
  TEMPLATE_BRACES,
  (): string => '',
);

export const addValuesToTemplate = (
  template: string,
  values: TemplateValues,
): string => template.replace(
  TEMPLATE_BRACES,
  (match: string): string => {
    const label = match.slice(2, -2);
    const value = values[label] as string;
    return value || match;
  },
);
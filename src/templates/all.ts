import { imageTemplate } from './imageTemplate.html';
import { reportTemplate } from './report.html';
import { testResultTemplate } from './testResult.html';
import { testSuiteTemplate } from './testSuite.html';
import { TEMPLATE_BRACES } from '../constants/constants';
import { Content, ReportData, TestResult } from "../report/eventHandlers";

export { imageTemplate } from './imageTemplate.html';
export { reportTemplate } from './report.html';
export { testResultTemplate } from './testResult.html';
export { testSuiteTemplate } from './testSuite.html';

export interface Templates {
  [templateName: string]: string;
}

export const getTemplates = (): Templates => ({
  reportTemplate,
  testSuiteTemplate,
  testResultTemplate,
  imageTemplate,
});

export const clearAllTemplateValues = (
  template: string,
): string => template.replace(
  TEMPLATE_BRACES,
  (): string => '',
);

export const addValuesToTemplate = (
  template: string,
  values: TestResult | ReportData | Content,
): string => template.replace(
  TEMPLATE_BRACES,
  (match: string): string => {
    const label = match.slice(2, -2);
    const value = values[label];
    return (value || match) as string;
  },
);

export default {
  addValuesToTemplate,
  clearAllTemplateValues,
  getTemplates,
  reportTemplate,
  testSuiteTemplate,
  testResultTemplate,
  imageTemplate,
};

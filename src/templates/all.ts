import { imageTemplate } from './image.html';
import { reportTemplate } from './report.html';
import { testResultTemplate } from './testResult.html';
import { testSuiteTemplate } from './testSuite.html';
import { tableHeaderTemplate } from './tableHeader.html';
import { tableTemplate } from './table.html';
import { tableRowTemplate } from './tableRow.html';
import { TEMPLATE_BRACES } from '../constants/constants';
import { Content, ReportData, TestResult } from '../report/eventHandlers';
import { tableDataTemplate } from './tableData.html';

export { imageTemplate } from './image.html';
export { reportTemplate } from './report.html';
export { testResultTemplate } from './testResult.html';
export { testSuiteTemplate } from './testSuite.html';
export { tableRowTemplate } from './tableRow.html';
export { tableTemplate } from './table.html';
export { tableHeaderTemplate } from './tableHeader.html';
export { tableDataTemplate } from './tableData.html';

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
  tableRowTemplate,
  tableHeaderTemplate,
  tableDataTemplate,
  tableTemplate,
};

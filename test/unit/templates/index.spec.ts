import { expect } from 'chai';
import {
  reportTemplate,
  imageTemplate,
  testSuiteTemplate,
  testResultTemplate,
  addValuesToTemplate,
  clearAllTemplateValues,
  getTemplates,
} from '../../../src/templates/all';

describe('templates', () => {
  const firstTemplateLabel = 'test1';
  const secondTemplateLabel = 'test2';
  const value1 = 'testing123';
  const value2 = 'testing321';
  const getMockTemplate = (): string => '<h1>{{test1}}</h1><h2>{{test2}}</h2>';

  describe('getTemplates', (): void => {
    it('Will get an object with each template in it', async (): Promise<void> => {
      expect(await getTemplates()).to.eql({
        imageTemplate,
        reportTemplate,
        testSuiteTemplate,
        testResultTemplate,
      });
    });
  });
  describe('addValuesToTemplate', () => {
    it ('Will replace a template label with it\'s appropriate value(s)', () => {
      const result = addValuesToTemplate(getMockTemplate(), {
        [firstTemplateLabel]: value1,
        [secondTemplateLabel]: value2
      });
      expect(result).to.equal('<h1>testing123</h1><h2>testing321</h2>');
    });
    it('Will only replace values passed in as "addValuesToTemplate"\'s second argument', () => {
      const result = addValuesToTemplate(getMockTemplate(), {
        [firstTemplateLabel]: value1,
      });
      expect(result).to.equal('<h1>testing123</h1><h2>{{test2}}</h2>');
    });
    it('Will not replace any values if nothing is passed in as the second argument', () => {
      const template = getMockTemplate();
      expect(addValuesToTemplate(template, {})).to.equal(template);
    });
  });
  describe('clearAllTemplateValues', () => {
    it('Will remove all template values', () => {
      expect(clearAllTemplateValues(getMockTemplate())).to.equal('<h1></h1><h2></h2>')
    });
  });
});
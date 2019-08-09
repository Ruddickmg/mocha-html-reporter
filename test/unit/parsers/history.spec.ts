import { expect } from 'chai';
import { DATA_CLOSING_TAGS, DATA_OPENING_TAGS } from '../../../src/constants/html';
import { parseDataFromHtml } from '../../../src/parsers/history';

describe('historyParser', (): void => {
  describe('parseDataFromHtml', (): void => {
    it('Will get json data from the data script element in html output', (): void => {
      const data = { testing: 123 };
      const html = `<head id="testing">${DATA_OPENING_TAGS}${JSON.stringify(data)}${DATA_CLOSING_TAGS}</head>`;
      expect(JSON.parse(parseDataFromHtml(html))).to.eql(data);
    });
  });
});

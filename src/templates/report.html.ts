import { minifyHtml } from '../formatting/minification';
import { DATA_CLOSING_TAGS, DATA_OPENING_TAGS } from '../constants/html';

export interface ReportInput {
  data: string;
  styles: string;
  scripts: string;
  pageTitle: string;
}

const dataTags = `${DATA_OPENING_TAGS}${DATA_CLOSING_TAGS}`;

export const reportTemplate = ({
  data,
  styles,
  scripts,
  pageTitle,
}: ReportInput): string => minifyHtml(
  `<!DOCTYPE html>
  <html lang="en">
  <head>
      <style>${styles}</style>
      <meta charset="UTF-8">
      <title>${pageTitle}</title>
      <script src="/socket.io/socket.io.js"></script>
      ${dataTags}
      <script>${scripts}</script>
  </head>
  <body>
      <header id="report-header"></header>
      <section id="history"></section>
      <section id="test-results">
          <ul id="test-suites"></ul>
      </section>
      <section id="statistics"></section>
  </body>
  </html>`,
)
  .split(dataTags)
  .join(`${DATA_OPENING_TAGS}${data}${DATA_CLOSING_TAGS}`);

export default reportTemplate;

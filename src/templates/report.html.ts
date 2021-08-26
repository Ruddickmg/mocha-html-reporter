import { DATA_CLOSING_TAGS, DATA_OPENING_TAGS } from '../constants/html';
import {
  HISTORY,
  REPORT_FOOTER,
  REPORT_HEADER,
  STATISTICS,
  TEST_RESULTS,
  TEST_SUITES,
} from '../scripts/constants';

export const reportTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{pageTitle}}</title>
    <style>
        {{styles}}
    </style>
    ${DATA_OPENING_TAGS}{{data}}${DATA_CLOSING_TAGS}
    <script>
      {{scripts}}
    </script>
</head>
<body>
    <header id="${REPORT_HEADER}"></header>
    <section id="${TEST_RESULTS}">
        <ul id="${TEST_SUITES}"></ul>
    </section>
    <section id="${HISTORY}"></section>
    <section id="${STATISTICS}"></section>
    <footer id="${REPORT_FOOTER}">
        <h3>Written by Marcus Ruddick.</h3>
    </footer>
</body>
</html>`;
export default reportTemplate;

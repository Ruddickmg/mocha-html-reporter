import {DATA_CLOSING_TAGS, DATA_OPENING_TAGS} from "../constants/html";

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
    <header id="report-header">

    </header>
    <section id="test-results">
        <ul id="test-suites">
            {{suites}}
        </ul>
    </section>
    <section id="history">
        {{history}}
    </section>
    <section id="statistics">
        {{statistics}}
    </section>
    <footer id="report-footer">
        <h3>Written by Marcus Ruddick.</h3>
    </footer>
</body>
</html>`;
export default reportTemplate;

export interface ReportInput {
  data: string;
  styles: string;
  scripts: string;
  pageTitle: string;
}

export const reportTemplate = ({
  data,
  styles,
  scripts,
  pageTitle,
}: ReportInput): string => `<!DOCTYPE html>
<html lang="en">
<head>
    <style>${styles}</style>
    <meta charset="UTF-8">
    <title>${pageTitle}</title>
    <script src="/socket.io/socket.io.js"></script>
    <script id="data">${data}</script>
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
</html>`;

export default reportTemplate;

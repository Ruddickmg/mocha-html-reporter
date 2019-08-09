export const reportTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{pageTitle}}</title>
    <style>
        {{styles}}
    </style>
    <script id="data">
        { "hello": "Hello World!" }
    </script>
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

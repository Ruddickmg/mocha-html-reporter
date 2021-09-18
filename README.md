# mocha-html-reporter
The reporter generates an html file with all the data, scripts and styles needed to operate embedded into it. The goal behind this is to make the document easily viewed and portable.

Since the document has all it's data embedded, the reporter compiles the html, css and js necessary to display the test results into the smallest size possible within the document.

The html document itself also acts as storage, any test results generated while an existing html report is present will be appended into the existing report and can be viewed in relation to each other. Multiple test results/runs occurring on the same day will be combined

Since the entire history of daily test runs is stored within a single html file, eventually the file size may grow to a size that is larger than desired. The goal of this project is to minimize this as much as possible, while recognizing that unbounded growth will always become very large at some point.

##Usage


```shell
$ mocha -O outputFile=pathToSomeDirectory/report.html --reporter mocha-html-reporter
```
### Arguments
`outputFile` (string) specifies where the report will be output to, defaults to `./report.html`

`reporter` (string) specifies a reporter to use for formatting command line test results

`screenShotEachTest` (boolean) will take a screenshot of each test (if running in a browser)

`screenShotOnFailure` (boolean) will take a screenshot of failed tests (if running in a browser)



## Installation
```shell
$ npm install
```

## Development
```shell
$ npm run dev
```
development will generate a new report after each code change
## Testing
There are two portions of the app, the `reporter` which is tested via unit tests, and the `report`, which is tested via "browser" tests

### to run unit tests
```shell
$ npm run test:unit
```

### to run browser tests
```shell
$ npm run test:browser
```
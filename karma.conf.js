module.exports = function (config) {
  config.set({
    logLevel: config.LOG_ERROR,
    basePath: '.',
    concurrency: Infinity,
    singleRun: true,
    frameworks: ['mocha', 'chai', 'karma-typescript'],
    files: [
      { pattern: 'test/scripts/**/*.spec.ts' },
      { pattern: 'src/scripts/**/*.ts' },
      { pattern: 'src/constants/script.ts' },
    ],
    preprocessors: {
      '**/*.ts': ['karma-typescript'],
    },
    browsers: [
      'ChromeHeadless',
      'FirefoxHeadless',
    ],
    karmaTypescriptConfig: {
      compilerOptions: {
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        downlevelIteration: true,
        noEmitHelpers: true,
        importHelpers: true,
        sourceMap: true,
        lib: ['es6', 'dom', 'ES2015', 'node'],
        types: [
          'mocha',
          'node',
        ],
        moduleResolution: 'node',
        module: 'commonjs',
        target: 'ES5',
      },
      exclude: ['node_modules'],
    },
    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: [
          '-headless',
        ],
        prefs: {
          'network.proxy.type': 0,
        },
      },
    },
    client: {
      mocha: {
        reporter: 'html',
        require: [
          '/var/www/root/mocha-html-reporter/test/helpers/initializeMocha.js',
        ],
      },
    },
  });
};

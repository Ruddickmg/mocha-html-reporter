module.exports = function (config) {
  config.set({
    logLevel: config.LOG_INFO,
    basePath: '.',
    concurrency: Infinity,
    singleRun: true,
    frameworks: ['mocha', 'chai', 'karma-typescript'],
    files: [
      { pattern: "test/helpers/**/*.ts" },
      { pattern: 'test/unit/scripts/**/*.spec.ts' },
      { pattern: 'src/scripts/**/*.ts' },
      { pattern: 'src/constants/*' }
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
        esModuleInterop: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        downlevelIteration: true,
        noEmitHelpers: true,
        importHelpers: true,
        sourceMap: true,
        // lib: ['es6', 'dom', 'ES2015', 'node'],
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
            require.resolve('./test/helpers/initializeMocha.ts'),
        ],
      },
    },
  });
};

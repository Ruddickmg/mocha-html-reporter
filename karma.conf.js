// eslint-disable-next-line import/no-extraneous-dependencies
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    downlevelIteration: true,
  },
});

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'karma-typescript'],
    files: [
      'test/**/*.ts',
    ],
    preprocessors: {
      'test/**/*.ts': 'karma-typescript',
    },
    browsers: [
      'ChromeHeadless',
      'FirefoxHeadless',
    ],
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
          './test/helpers/initializeMocha.ts',
        ],
      },
    },
  });
};

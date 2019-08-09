import { expect } from 'chai';
import { Environment, ExpectedOptions, getCommandLineOptions } from '../../../src/parsers/commandLineOptions';

describe('commandLineOptions', (): void => {
  const outputDir = 'test/unit';
  const fileName = 'testFile';
  describe('getCommandLineOptions', (): void => {
    it('Will extract options from the "environment" passed in from the mocha test runner', (): void => {
      const reporterOptions = {
        outputDir,
        fileName,
        testDir: '/someOtherDirectory',
        screenShotEachTest: true,
        screenShotOnFailure: true,
      } as ExpectedOptions;
      const environment: Environment = { reporterOptions };
      expect(getCommandLineOptions(environment))
        .to.eql(reporterOptions);
    });
    it('Will return an empty object if no environment is found', (): void => {
      expect(getCommandLineOptions()).to.eql({});
    });
  });
});

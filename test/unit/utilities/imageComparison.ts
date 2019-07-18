import { expect } from 'chai';
import { unlinkSync, existsSync } from 'fs';
import { compareImageToBaseline, setScreenShotDirectory } from '../../../src/utilities/imageComparison';
import { base64ImageOne, base64ImageTwo } from '../../helpers/base64Images';

const screenShotDirectory = './test/reports';
const createTestFileName = (name: string): string => `${screenShotDirectory}/${name}.png`;
const removeTestFile = (name: string): void => existsSync(name) && unlinkSync(name);
const TIME_TO_COMPLETE = 10000;

describe('compareImageToBaseline', function compareImageToBaselineSpec(): void {
  this.timeout(TIME_TO_COMPLETE);
  setScreenShotDirectory(screenShotDirectory);
  [{
    location: {
      x: 1,
      y: 0,
      width: 100,
      height: 100,
    },
    title: '',
  }, {
    location: null,
    title: 'without specified dimensions',
  }].forEach((
    { title, location },
    index: number,
  ): void => {
    const modifiedLocation = location ? { ...location, x: 10 } : location;
    it(`Will create a baseline image if none exists ${title}`, async (): Promise<void> => {
      const name = `boo-${index}`;
      const testFileName = createTestFileName(name);
      await compareImageToBaseline(base64ImageOne, name, location);
      const exists = existsSync(testFileName);
      removeTestFile(testFileName);
      expect(exists).to.equal(true);
    });
    it(`Will return an "image" which is the original screenshot if no baseline image exists ${title}`, async () : Promise<void> => {
      const name = `woo-${index}`;
      const testFileName = createTestFileName(name);
      const result = await compareImageToBaseline(base64ImageOne, name, location);
      removeTestFile(testFileName);
      expect(result).to.include.keys('image');
    });
    ['difference', 'baseline', 'screenshot']
      .forEach((imageType: string): any => it(
        `Will compare a screenshot to a previously stored image and return a "${imageType}" image if a difference was found ${title}`,
        async ():Promise<void> => {
          const name = `zoo-${imageType}-${index}`;
          const testFileName = createTestFileName(name);
          await compareImageToBaseline(base64ImageOne, name, location);
          const result = await compareImageToBaseline(
            location ? base64ImageOne : base64ImageTwo,
            name,
            modifiedLocation,
          );
          removeTestFile(testFileName);
          expect(result).to.include.keys('difference');
        },
      ));
    it(
      `Will return an "image" property with the screenshot taken if there is no difference between the baseline and current screenshot images ${title}`,
      async (): Promise<void> => {
        const name = `poo-${index}`;
        const testFileName = createTestFileName(name);
        const result = await compareImageToBaseline(base64ImageOne, name, location);
        removeTestFile(testFileName);
        expect(result).to.include.keys('image');
      },
    );
  });
});

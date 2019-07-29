import { expect } from 'chai';
import {
  handleFailedScreenShot,
} from '../../../src/utilities/screenshots';
import { base64NoImageString } from '../../../src/constants/base64NoImageString';

describe('screenshots', (): void => {
  describe('handleFailedScreenShot', (): void => {
    it('Will return a base 64 image string in a promise', async (): Promise<void> => {
      const image = await handleFailedScreenShot();
      expect(image).to.equal(base64NoImageString);
    });
  });
});

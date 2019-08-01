import { expect } from 'chai';
import { flattenArray } from '../../../src/utilities/arrays';

describe('arrays', (): void => {
  describe('flattenArray', (): void => {
    it('Flattens an array by one level', (): void => {
      expect(flattenArray([[1], [2, 3], [4, 5, 6]]))
        .to.eql([1, 2, 3, 4, 5, 6]);
    });
  });
});

import { expect } from 'chai';
import { flattenArray, getIndexOfMinValue, quickMerge } from '../../../src/utilities/arrays';

describe('arrays', (): void => {
  describe('flattenArray', (): void => {
    it('Flattens an array by one level', (): void => {
      expect(flattenArray([[1], [2, 3], [4, 5, 6]]))
        .to.eql([1, 2, 3, 4, 5, 6]);
    });
  });
  describe('quickMerge', (): void => {
    const arrOne = [0, 1, 2, 3, 4];
    const arrTwo = [5, 6, 7, 8, 9];
    const merged = [...arrOne, ...arrTwo];
    it('Will merge two arrays', (): void => {
      expect(quickMerge(arrOne, arrTwo)).to.eql(merged);
    });
  });
  describe('getIndexOfMaxValue', (): void => {
    it('Will get the index of the lowest number in an array', (): void => {
      const indexOfLowestValue = 4;
      const lowestNumber = -20;
      const arr = [1, 2, 1, 10, 4, -1, 3];
      arr[indexOfLowestValue] = lowestNumber;
      expect(getIndexOfMinValue(arr)).to.equal(indexOfLowestValue);
    });
  });
});

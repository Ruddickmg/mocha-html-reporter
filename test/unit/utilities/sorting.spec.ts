import { expect } from 'chai';
import {
  sortNumbersDecrementing,
  sortNumbersIncrementing,
  sortTestResultsByDate,
} from '../../../src/utilities/sorting';
import { TestResult } from '../../../src/report/eventHandlers';

describe('sorting', (): void => {
  const decrementing = [5, 4, 3, 2, 1];
  const incrementing = [1, 2, 3, 4, 5];
  describe('sortNumbersDecrementing', (): void => {
    it('Will sort numbers in random order', (): void => {
      expect([1, 4, 3, 5, 2].sort(sortNumbersDecrementing)).to.eql(decrementing);
    });
    it('Will sort numbers in reverse order', (): void => {
      expect([5, 4, 3, 2, 1].sort(sortNumbersDecrementing)).to.eql(decrementing);
    });
    it('Will not change the order of decrementing numbers', (): void => {
      expect(decrementing.sort(sortNumbersDecrementing)).to.eql(decrementing);
    });
  });
  describe('sortNumbersIncrementing', (): void => {
    it('Will sort numbers in random order', (): void => {
      expect([1, 4, 3, 5, 2].sort(sortNumbersIncrementing)).to.eql(incrementing);
    });
    it('Will sort numbers in reverse order', (): void => {
      expect([5, 4, 3, 2, 1].sort(sortNumbersIncrementing)).to.eql(incrementing);
    });
    it('Will not change the order of decrementing numbers', (): void => {
      expect(incrementing.sort(sortNumbersIncrementing)).to.eql(incrementing);
    });
  });
  describe('sortTestResultsByDate', (): void => {
    const convertToTestResults = (date: number): TestResult => ({ date } as TestResult);
    const results = decrementing.map(convertToTestResults);
    it('Will sort test results in random order', (): void => {
      expect(sortTestResultsByDate([1, 4, 3, 5, 2].map(convertToTestResults))).to.eql(results);
    });
    it('Will sort test results in reverse order', (): void => {
      expect(sortTestResultsByDate(results.reverse())).to.eql(results);
    });
    it('Will not change the order of decrementing test results', (): void => {
      expect(sortTestResultsByDate(results)).to.eql(results);
    });
  });
});

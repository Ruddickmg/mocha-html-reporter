import { expect } from 'chai';
import { compose, mapOverObject } from "../../../src/utilities/functions";

describe('functions', (): void => {
  describe('compose', (): void => {
    const startingValue = 1;
    const addTwo = (a: number): number => a + 2;
    const convertToString = (a: any): string => `${a}`;
    const addTheLetterD = (a: string): string => `${a}D`;
    it('Will apply an array of functions to a value', () => {
      expect(compose(addTwo, convertToString, addTheLetterD)(startingValue))
        .to.equal(addTheLetterD(convertToString(addTwo(startingValue))));
    });
  });
  describe('mapOverObject', (): void => {
    const modifier = (a: number): number => a + 1;
    const arrayModifier = (a: number[]): number[] => a.map(modifier);
    const firstKey = 'uno';
    const secondKey = 'dos';
    const firstValue = 1;
    const secondValue = 2;
    const thirdValue = 2;
    const object = {
      [firstKey]: [firstValue],
      [secondKey]: [secondValue, thirdValue],
    };
    it('Will map over test results indexed by date', () => expect(
        mapOverObject(arrayModifier, object),
      ).to.eql({
          [firstKey]: [modifier(firstValue)],
          [secondKey]: [
            modifier(secondValue),
            modifier(thirdValue)],
        }),
    );
  });
});
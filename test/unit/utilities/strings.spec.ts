import { expect } from 'chai';
import { capitalizeFirstLetter, splitStringIntoChunks } from '../../../src/utilities/strings';

describe('strings', (): void => {
  describe('capitalizeFirstLetter', (): void => {
    it('Will capitalize a strings first char', (): void => {
      const word = 'hello';
      const capitalized = 'Hello';
      expect(capitalizeFirstLetter(word)).to.equal(capitalized);
    });
    it('Will return what was passed in if it is not a string', (): void => {
      const notAString = [1, 2, 3, 4, 5];
      expect(capitalizeFirstLetter(notAString as unknown as string)).to.equal(notAString);
    });
    it('Will return an empty string if passed an empty string', (): void => {
      const emptyString = '';
      expect(capitalizeFirstLetter(emptyString)).to.equal(emptyString);
    });
    it('Will handle one character words', (): void => {
      const oneCharWord = 'i';
      const capitalized = 'I';
      expect(capitalizeFirstLetter(oneCharWord)).to.equal(capitalized);
    });
  });
  describe('splitStringIntoChunks', (): void => {
    const testString = '123456789';
    it('Splits a string into an array with as many of the same sized strings as possible', (): void => {
      expect(splitStringIntoChunks(testString, 2))
        .to.eql(['12', '34', '56', '78', '9']);
    });
    it('Keeps the remainder after splitting', (): void => {
      expect(splitStringIntoChunks(testString, 6))
        .to.eql(['123456', '789']);
    });
  });
});

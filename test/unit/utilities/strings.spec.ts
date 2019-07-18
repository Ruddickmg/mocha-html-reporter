import { expect } from 'chai';
import {capitalizeFirstLetter} from "../../../src/utilities/strings";

describe('strings', (): void => {
  describe('capitalizeFirstLetter', (): void => {
    it('Will capitalize a strings first char', () => {
      const word = 'hello';
      const capitalized = 'Hello';
      expect(capitalizeFirstLetter(word)).to.equal(capitalized);
    });
    it('Will return what was passed in if it is not a string', () => {
      const notAString = [1, 2, 3, 4, 5];
      expect(capitalizeFirstLetter(notAString as unknown as string)).to.equal(notAString);
    });
    it('Will return an empty string if passed an empty string', () => {
      const emptyString = '';
      expect(capitalizeFirstLetter(emptyString)).to.equal(emptyString);
    });
    it('Will handle one character words', () => {
      const oneCharWord = 'i';
      const capitalized = 'I';
      expect(capitalizeFirstLetter(oneCharWord)).to.equal(capitalized);
    });
  });
});
import { expect } from 'chai';
import { isAllowedInVariableName, parseVariableName } from '../../../src/parsers/variableName';
import { EMPTY_STRING } from '../../../src/scripts/constants';

describe('variableName', (): void => {
  describe('isAllowedInVariableName', (): void => {
    it('Returns true if allowed variables are in the string', (): void => {
      expect(isAllowedInVariableName('_.12ab')).to.equal(true);
    });
    [')', '(', '=', '#', ' ', '/', '\\', '[', ']', '-']
      .forEach((char: string): any => it(
        `Returns false if a variable name contains a "${char}" character`,
        (): void => {
          expect(isAllowedInVariableName(`a-b.1a2_b${char}c`)).to.equal(false);
        },
      ));
  });

  describe('parseVariableName', (): void => {
    const variableName = 'aj_1.a23';
    it('Parses a variable name with leading spaces', (): void => {
      expect(
        ` ${variableName} `.split(EMPTY_STRING)
          .reduce((
            _: string | boolean,
            char: string,
          ): string | boolean => parseVariableName(char), EMPTY_STRING),
      )
        .to.equal(variableName);
    });
    it('Parses a variable name attached to an open parentheses', (): void => {
      expect(
        `${variableName}(`.split(EMPTY_STRING)
          .reduce((
            _: string | boolean,
            char: string,
          ): string | boolean => parseVariableName(char), EMPTY_STRING),
      )
        .to.equal(variableName);
    });
  });
});

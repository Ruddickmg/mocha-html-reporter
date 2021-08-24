import { expect } from 'chai';
import {
  buildParseTree,
  createParser,
} from '../../../src/parsers/parser';
import { EMPTY_STRING } from '../../../src/scripts/constants';

describe('parser', (): void => {
  describe('buildParser', (): void => {
    it('Builds a parser that can parse character input into values', (): void => {
      const symbol = 'var';
      expect(buildParseTree({ ' var ': symbol }))
        .to.eql({
          ' ': {
            v: {
              a: {
                r: {
                  ' ': symbol,
                },
              },
            },
          },
        });
    });
    it('Combines multiple symbols into a symbol tree', (): void => {
      const symbolOne = 'var';
      const symbolTwo = 'vas';
      expect(buildParseTree({ ' var ': symbolOne, ' vas ': symbolTwo }))
        .to.eql({
          ' ': {
            v: {
              a: {
                r: {
                  ' ': symbolOne,
                },
                s: {
                  ' ': symbolTwo,
                },
              },
            },
          },
        });
    });
    it('Throws an error when attempting to over write an existing symbol', (): void => {
      const existingSymbol = 'function';
      const overwritingSymbol = 'functional';
      expect(buildParseTree.bind({}, {
        [existingSymbol]: existingSymbol,
        [overwritingSymbol]: overwritingSymbol,
      })).to.throw();
    });
  });
  describe('createParser', (): void => {
    const symbol = 'hello';
    const helloParser = createParser(buildParseTree({ [symbol]: symbol }));
    const almostButNotQuite = 'gi cuebert, well today... ';
    const rest = 'hell';
    it('Creates a parser that will indicate whether it has seen a symbol while moving through a string', (): void => {
      almostButNotQuite.split(EMPTY_STRING).forEach((char: string): void => {
        expect(helloParser(char)).to.equal(false);
      });
      rest.split(EMPTY_STRING).forEach((char: string): void => {
        expect(helloParser(char)).to.equal(true);
      });
      expect(helloParser('o')).to.equal(symbol);
      expect(helloParser('g')).to.equal(false);
    });
  });
});

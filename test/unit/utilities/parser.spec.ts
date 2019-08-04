import { expect } from 'chai';
import {
  buildParseTree,
  createParser,
  isAllowedInVariableName,
  parseCodeBlock,
  parseVariableName,
} from '../../../src/utilities/parser';
import { EMPTY_STRING } from '../../../src/constants/constants';

describe('parser', (): void => {
  const firstVariableName = 'someFunk';
  const secondVariableName = 'someVariable';
  const functionCodeBlock = `function () {
          console.log('hello, I am a code block!');
      var ${secondVariableName} = function () {};      };`;
  const func = `var ${firstVariableName} = ${functionCodeBlock}`;
  const assignment = `       var ${secondVariableName} = 'some other thing';`;

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
  describe('parseCodeBlock', (): void => {
    it('Will parse a function to extract it from a code file', (): void => {
      expect(
        func
          .split(EMPTY_STRING)
          .reduce((
            _: string,
            char: string,
          ): string | boolean => parseCodeBlock(char), EMPTY_STRING),
      )
        .to.equal(func);
    });
    it('Will parse an assignment to extract from a code file', (): void => {
      expect(
        assignment
          .split(EMPTY_STRING)
          .reduce((
            _: string,
            char: string,
          ): string | boolean => parseCodeBlock(char), EMPTY_STRING),
      )
        .to.equal(assignment);
    });
  });
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

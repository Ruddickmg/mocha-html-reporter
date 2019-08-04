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
    it('Will parse a function that ends with a new line character', (): void => {
      const endingWithNewLine = 'function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n';
      expect(
        endingWithNewLine
          .split(EMPTY_STRING)
          .reduce((
            _: string,
            char: string,
          ): string | boolean => parseCodeBlock(char), EMPTY_STRING),
      )
        .to.equal(endingWithNewLine);
    });
    it('Will parse a function that ends with a new line character', (): void => {
      const endingWithNewLine = 'function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n';
      expect(
        endingWithNewLine
          .split(EMPTY_STRING)
          .reduce((
            _: string,
            char: string,
          ): string | boolean => parseCodeBlock(char), EMPTY_STRING),
      )
        .to.equal(endingWithNewLine);
    });
    it('Will parse a function that begins with a new line character', (): void => {
      const expected = 'function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n';
      const beginningWithNewline = `\n${expected}`;
      expect(
        beginningWithNewline
          .split(EMPTY_STRING)
          .reduce((
            _: string,
            char: string,
          ): string | boolean => parseCodeBlock(char), EMPTY_STRING),
      )
        .to.equal(expected);
    });
    it('Will parse multiple functions without semicolon terminators', (): void => {
      const expected = 'function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }\n';
      const testCode = `function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
`;
      expect(
        testCode
          .split(EMPTY_STRING)
          .reduce((
            _: string,
            char: string,
          ): string | boolean => parseCodeBlock(char), EMPTY_STRING),
      )
        .to.equal(expected);
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

import { expect } from 'chai';
import { EMPTY_STRING } from '../../../src/constants/punctuation';
import { parseCodeBlock } from '../../../src/parsers/code';

describe('code', (): void => {
  describe('parseCodeBlock', (): void => {
    const firstVariableName = 'someFunk';
    const secondVariableName = 'someVariable';
    const functionCodeBlock = `function () {
          console.log('hello, I am a code block!');
      var ${secondVariableName} = function () {};      };`;
    const func = `var ${firstVariableName} = ${functionCodeBlock}`;
    const closingBracketInString = 'var SOMETHING_ELSE = \'}\';';
    const bracketInString = `var SOMETHING = '{';\n${closingBracketInString}`;
    const assignment = `       var ${secondVariableName} = 'some other thing';`;
    const postEscape = 'var OPENING_CURLY = \'{\';';
    const preEscape = `var QUOTATION_MARK = '"';\nexports.QUOTATION_MARK = QUOTATION_MARK;\nvar SINGLE_QUOTE = '\\'';\nexports.SINGLE_QUOTE = SINGLE_QUOTE;\n${postEscape}`;
    const escapedEscapeString = 'var ESCAPE_STRING = \'\\\\\';';
    it('Won\'t parse escaped string chars', (): void => {
      expect(
        preEscape
          .split(EMPTY_STRING)
          .reduce((
            _: string,
            char: string,
          ): string | boolean => parseCodeBlock(char), EMPTY_STRING),
      ).to.equal(postEscape);
    });
    it('Won\'t parse escaped escape strings', (): void => {
      expect(
        escapedEscapeString
          .split(EMPTY_STRING)
          .reduce((
            _: string,
            char: string,
          ): string | boolean => parseCodeBlock(char), EMPTY_STRING),
      ).to.equal(escapedEscapeString);
    });
    it('Won\'t parse opening and curly brackets that are within strings', (): void => {
      expect(
        bracketInString
          .split(EMPTY_STRING)
          .reduce((
            _: string,
            char: string,
          ): string | boolean => parseCodeBlock(char), EMPTY_STRING),
      ).to.equal(closingBracketInString);
    });
    it('Parses a function to extract it from a code file', (): void => {
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
    it('Parses an assignment to extract from a code file', (): void => {
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
    it('Parses a function that ends with a new line character', (): void => {
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
    it('Parses a function that ends with a new line character', (): void => {
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
    it('Parses a function that begins with a new line character', (): void => {
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
    it('Parses multiple functions without semicolon terminators', (): void => {
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
});

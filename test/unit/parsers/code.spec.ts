import { expect } from 'chai';
import { parseCodeBlock } from '../../../src/parsers/code';
import { EMPTY_STRING } from '../../../src/scripts/constants';

describe('code', (): void => {
  describe('parseCodeBlock', (): void => {
    const firstVariableName = 'someFunk';
    const secondVariableName = 'someVariable';
    const functionCodeBlock = `function () {
          console.log('hello, I am a code block!');
      var ${secondVariableName} = function () {};      };`;
    const func = `var ${firstVariableName} = ${functionCodeBlock}`;
    const assignment = `       var ${secondVariableName} = 'some other thing';`;
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
});

import { expect } from 'chai';
import { parseCodeBlock, immediatelyInvokedFunction } from '../../../src/parsers/code';
import { EMPTY_STRING } from '../../../src/scripts/constants';

const firstVariableName = 'someFunk';
const secondVariableName = 'someVariable';
const functionCodeBlock = `function () {
          console.log('hello, I am a code block!');
      var ${secondVariableName} = function () {};      };`;
const func = `var ${firstVariableName} = ${functionCodeBlock}`;
const assignment = `       var ${secondVariableName} = 'some other thing';`;
const immediatelyInvokedFunctionString = `(function (TagName) {
        TagName["li"] = "li";
        TagName["ul"] = "ul";
        TagName["div"] = "div";
        TagName["h1"] = "h1";
        TagName["h2"] = "h2";
        TagName["h3"] = "h3";
        TagName["h4"] = "h4";
        TagName["image"] = "img";
        TagName["tableRow"] = "tr";
        TagName["tableData"] = "td";
        TagName["button"] = "button";
        TagName["table"] = "table";
      })(TagName || (exports.TagName = TagName = {}));`;

describe('code', (): void => {
  describe('parseCodeBlock', (): void => {
    it('tests immediately invoked function with regex', () => {
      expect(immediatelyInvokedFunction.test(immediatelyInvokedFunctionString)).to.equal(true);
    });
    it('Will parse immediately invoked functions', () => {
      expect(immediatelyInvokedFunctionString.split(EMPTY_STRING)
        .reduce((
          _: string,
          char: string,
        ): string | boolean => parseCodeBlock(char), EMPTY_STRING))
        .to.equal('(function (TagName) {\n        TagName["li"] = "li";\n        TagName["ul"] = "ul";\n        TagName["div"] = "div";\n        TagName["h1"] = "h1";\n        TagName["h2"] = "h2";\n        TagName["h3"] = "h3";\n        TagName["h4"] = "h4";\n        TagName["image"] = "img";\n        TagName["tableRow"] = "tr";\n        TagName["tableData"] = "td";\n        TagName["button"] = "button";\n        TagName["table"] = "table";\n      })(TagName || (exports.TagName = TagName = {}));');
    });
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

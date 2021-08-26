import { CodeStore } from '../compilation';
import {
  buildParseTree,
  createParser,
  Parser,
  Symbols,
} from './parser';
import { isNumeric } from '../scripts/utilities/typeChecks';
import { EMPTY_STRING } from '../scripts/constants';

const allowedVariableNamePrefixes = ['(', '[', ',', ' ']
  .reduce((
    prefixes: CodeStore,
    prefix: string,
  ): CodeStore => ({
    ...prefixes,
    [prefix]: prefix,
  }), {});
const allowedVariableNameSuffixes = [')', ']', '.', ';', ',', ' ', '(', '[', '\n', '\r'];
const suffixesLength = allowedVariableNameSuffixes.length;

export const variableNameParser = (namesAndReplacements: Symbols): Parser => {
  const variablesMappedToReplacements: CodeStore = {};
  const variableNames = Object.keys(namesAndReplacements);
  let nameIndex = variableNames.length;
  // eslint-disable-next-line no-plusplus
  while (nameIndex--) {
    const variableName = variableNames[nameIndex];
    const replacement = namesAndReplacements[variableName];
    let suffixIndex = suffixesLength;
    // eslint-disable-next-line no-plusplus
    while (suffixIndex--) {
      const suffix = allowedVariableNameSuffixes[suffixIndex];
      variablesMappedToReplacements[`${variableName}${suffix}`] = `${replacement}${suffix}`;
    }
  }
  return createParser(buildParseTree(variablesMappedToReplacements), allowedVariableNamePrefixes);
};

export const isAllowedInVariableName = (value: string): boolean => /^[a-z0-9|_|.]+$/i.test(value);

export const parseVariableName = ((): Parser => {
  let variableName = EMPTY_STRING;
  let started = false;
  return (char: string): string | boolean => {
    if (isAllowedInVariableName(char)) {
      variableName += char;
      started = true;
      return false;
    }
    const result = started
      && !!variableName.length
      && !isNumeric(variableName)
      && variableName;
    if (result) {
      started = false;
      variableName = EMPTY_STRING;
    }
    return result;
  };
})();

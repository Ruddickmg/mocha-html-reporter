import { isString } from '../scripts/utilities/typeChecks';

export const capitalizeFirstLetter = (word: string): string => (isString(word)
&& word.length > 0
  ? `${word[0].toUpperCase()}${word.slice(1)}`
  : word);

export default {
  capitalizeFirstLetter,
};

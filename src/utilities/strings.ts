import { isString } from './typeChecks';

export const capitalizeFirstLetter = (word: string): string => (isString(word)
&& word.length > 0
  ? `${word[0].toUpperCase()}${word.slice(1)}`
  : word);

export const splitStringIntoChunks = (content: string, size: number): string[] => {
  const length = Math.ceil(content.length / size);
  const result = new Array(length);
  for (let i = 0; i < length; i += 1) {
    const offset = i * size;
    result[i] = content.substring(offset, offset + size);
  }
  return result;
};

export default {
  capitalizeFirstLetter,
  splitStringIntoChunks,
};

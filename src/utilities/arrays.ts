export const flattenArray = (array: any[]): any[] => [].concat(...array);
export const quickMerge = (arrayOne: any[], arrayTwo: any[]): any[] => {
  const arrayOneLength = arrayOne.length;
  const arrayTwoLength = arrayTwo.length;
  const merged = [];
  for (let i = 0; i < arrayOneLength; i += 1) {
    merged.push(arrayOne[i]);
  }
  for (let i = 0; i < arrayTwoLength; i += 1) {
    merged.push(arrayTwo[i]);
  }
  return merged;
};
export const getIndexOfMinValue = (arr: number[] = []): number => {
  const { length } = arr;
  if (length === 0) {
    return -1;
  }
  let min = arr[0];
  let minIndex = 0;
  for (let i = 1; i < length; i += 1) {
    if (arr[i] < min) {
      minIndex = i;
      min = arr[i];
    }
  }
  return minIndex;
};

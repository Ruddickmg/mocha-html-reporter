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

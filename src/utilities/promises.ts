export const wait = (
  timeToWait: number = 0,
): Promise<void> => new Promise((resolve): void => {
  setTimeout(resolve, timeToWait);
});

interface Mapped {
  [key: string]: any;
}

type Modifier = (...args: any[]) => any;

export const compose = (
  functions: Modifier[],
  value: any,
): any => functions
  .reduce((
    composed: any,
    modifier: Modifier,
  ) => modifier(composed), value);

export const mapOverObject = (
  modifier: Modifier,
  object: Mapped,
): Mapped => Object
  .keys(object)
  .reduce((
    mapped: Mapped,
    key: string,
  ): Mapped => ({
    ...mapped,
    [key]: modifier(object[key]),
  }), {});
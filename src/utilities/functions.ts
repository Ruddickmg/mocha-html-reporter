interface Mapped {
  [key: string]: any;
}

type Modifier = (...args: any[]) => any;

export const compose = (
  ...functions: Modifier[]
): any => (
  value: any,
): any => {
  const { length } = functions;
  let result: any = value;
  for (let i = 0; i < length; i += 1) {
    result = functions[i](result);
  }
  return result;
};

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
    [key]: modifier(object[key], key, object),
  }), {});

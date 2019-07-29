export type TypeCheck = (obj: any) => boolean;

export interface TypeChecks {
  isFunction: TypeCheck;
  isArray: TypeCheck;
  isString: TypeCheck;
  isNumber: TypeCheck;
  isDate: TypeCheck;
  isRegExp: TypeCheck;
  [type: string]: TypeCheck;
}

export const typeChecks: TypeChecks = [
  'Array',
  'Function',
  'String',
  'Number',
  'Date',
  'RegExp',
].reduce((
  typeChecks: TypeChecks,
  name: string,
) => ({
  ...typeChecks,
  [`is${name}`]: (obj: any): boolean => Object.prototype.toString.call(obj) === `[object ${name}]`,
}), {} as TypeChecks);

export const {
  isArray,
  isFunction,
  isString,
  isNumber,
  isDate,
  isRegExp,
} = typeChecks;

export default typeChecks;

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

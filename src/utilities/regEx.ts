export const regExEscape = (code: string): string => code.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
export const escapedRegEx = (code: string): RegExp => new RegExp(regExEscape(code), 'g');

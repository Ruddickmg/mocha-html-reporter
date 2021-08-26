import { topologicalSort, ValueMap } from '../utilities/topologicalSort';
import { variableNameParser } from '../parsers/variableName';
import { isString } from '../scripts/utilities/typeChecks';
import { CodeStore } from '.';
import { ENTRY_POINT } from '../constants';
import { immediatelyInvokedFunction } from '../parsers/code';

type DependencyParser = (parent: string, code: string) => string[];

export const parseDependencies = (codeByVariableName: CodeStore): DependencyParser => {
  const variableNames: CodeStore = Object.keys(codeByVariableName).reduce((all, variable) => ({
    ...all,
    [variable]: variable,
  }), {});
  const parse = variableNameParser(variableNames);
  const parseVariableNames = (char: string): string | boolean => {
    const result = parse(char) as string;
    return isString(result)
      ? result.slice(0, -1)
      : result;
  };
  return (parent: string, code: string): string[] => {
    const dependencies: { [property: string]: string } = {};
    const len = code.length;
    let variable: string | boolean;
    for (let i = 0; i < len; i += 1) {
      variable = parseVariableNames(code[i]) as string;
      if (isString(variable) && variable !== parent) dependencies[variable] = variable;
    }
    return Object.keys(dependencies);
  };
};

export const mapDependencies = (codeByVariableName: CodeStore, root: string): ValueMap<string> => {
  const immediatelyInvokedFunctions: string[] = [];
  const parse = parseDependencies(codeByVariableName);
  const { [root]: node, ...nodes } = Object.keys(codeByVariableName)
    .reduce((mapped: ValueMap<string>, name: string): ValueMap<string> => {
      const code = codeByVariableName[name];
      if (immediatelyInvokedFunction.test(code)) immediatelyInvokedFunctions.push(name);
      return {
        ...mapped,
        [name]: {
          value: code,
          children: parse(name, code),
        },
      };
    }, {});
  return {
    ...nodes,
    [root]: {
      ...node,
      children: [
        ...node.children,
        ...immediatelyInvokedFunctions,
      ],
    },
  };
};

export const sortCodeInTopologicalOrder = (
  codeByVariableName: CodeStore,
  root: string = ENTRY_POINT,
): string[] => {
  const dependencyMap = mapDependencies(codeByVariableName, root);
  return topologicalSort(root, dependencyMap);
};

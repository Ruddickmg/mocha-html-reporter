export interface Node<T> {
  value: T;
  children: string[];
}

export interface ValueMap<T> {
  [name: string]: Node<T>;
}

export interface InDegrees {
  [index: string]: number;
}

export class CircularDependencyError extends Error {
  constructor(from: string, to: string) {
    super(`Circular dependency found between ${from} and ${to}`);
  }
}

export const removeUnreachableNodes = <T>(graph: ValueMap<T>): ValueMap<T> => {
  const dependencies: ValueMap<T> = {};
  const indices = Object.keys(graph);
  indices.forEach((name) => graph[name]
    .children.forEach((dependency) => {
      dependencies[dependency] = graph[dependency];
    }));
  return indices
    .filter((index: string): boolean => !!dependencies[index])
    .reduce((all, index) => ({
      ...all,
      [index]: graph[index],
    }), {});
};

export const calculateInDegrees = <T>(graph: ValueMap<T>): InDegrees => Object.keys(graph)
  .reduce((counts: InDegrees, graphIndex: string): InDegrees => {
    const { children } = graph[graphIndex];
    return {
      ...counts,
      ...children.reduce((count, index) => ({
        ...count,
        [index]: (counts[index] || 0) + 1,
      }), {}),
    };
  }, {});

export const topologicalSort = <T>(root: string, graph: ValueMap<T>): T[] => {
  const node = graph[root];
  const withoutRoots = removeUnreachableNodes(graph);
  const inDegree = calculateInDegrees({
    [root]: node,
    ...withoutRoots,
  });
  const result: T[] = [];
  const stack: [Node<T>, string][] = [[node, root]];
  let children: string[];
  let index: string;
  let count: number;
  let l: number;
  while (stack.length) {
    const [current, name] = stack.pop();
    children = current.children;
    l = children.length;
    // eslint-disable-next-line no-plusplus
    while (l--) {
      index = children[l];
      inDegree[index] -= 1;
      count = inDegree[index];
      if (count === 0) {
        stack.push([graph[index], index]);
      } else if (count < 0) throw new CircularDependencyError(index, name);
    }
    result.push(current.value);
  }
  return result;
};

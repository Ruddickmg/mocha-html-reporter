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

export const removeUnreachableNodes = <T>(
  root: string,
  graph: ValueMap<T>,
  length = 0,
): ValueMap<T> => {
  const dependencies: ValueMap<T> = {
    [root]: graph[root],
  };
  const indices = Object.keys(graph);
  const len = indices.length;
  if (len === length) return graph;
  indices.forEach((name) => graph[name]
    .children.forEach((dependency) => {
      dependencies[dependency] = graph[dependency];
    }));
  const unreachable = indices
    .filter((index: string): boolean => !!dependencies[index])
    .reduce((all, index) => ({
      ...all,
      [index]: graph[index],
    }), {});
  return removeUnreachableNodes(root, unreachable, len);
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
  const withoutRoots = {
    [root]: node,
    ...removeUnreachableNodes(root, graph),
  };
  const inDegree = calculateInDegrees(withoutRoots);
  const result: T[] = [];
  const stack: [Node<T>, string][] = [[node, root]];
  let children: string[];
  let index: string;
  let count: number;
  let l: number;
  const t: string[] = [];
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
        stack.push([withoutRoots[index], index]);
      } else if (count < 0) throw new CircularDependencyError(index, name);
    }
    t.push(name);
    result.push(current.value);
  }
  return result;
};

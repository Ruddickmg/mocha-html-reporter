import { expect } from 'chai';
import {
  topologicalSort,
  Node,
  CircularDependencyError,
  removeUnreachableNodes,
  calculateInDegrees,
} from '../../../src/utilities/topologicalSort';

const a = 'a';
const b = 'b';
const c = 'c';
const d = 'd';
const e = 'e';
const f = 'f';
const g = 'g';

const initialNode: string = a;

const nodes: { [node: string]: Node<string> } = {
  [a]: {
    value: a,
    children: [b, f],
  },
  [b]: {
    value: b,
    children: [c, d],
  },
  [c]: {
    value: c,
    children: [e],
  },
  [d]: {
    value: d,
    children: [e],
  },
  [e]: {
    value: e,
    children: [f],
  },
  [f]: {
    value: f,
    children: [],
  },
};

describe('removeUnreachableNodes', () => {
  it('removes all nodes that are not children of another node', () => {
    const unreachable = {
      ...nodes,
      [g]: {
        value: g,
        name: g,
        children: [a, b],
      },
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { g: _, ...rest } = nodes;
    expect(removeUnreachableNodes(unreachable)).to.deep.equal(rest);
  });
});

describe('calculateInDegrees', () => {
  it('calculates the number of times each node is listed as a child node', () => {
    expect(calculateInDegrees(nodes)).to.deep.equal({
      b: 1,
      c: 1,
      d: 1,
      e: 2,
      f: 2,
    });
  });
});

describe('topologicalSort', () => {
  it('sorts items topologically', () => {
    expect(topologicalSort(initialNode, nodes))
      .to.deep.equal([a, b, c, d, e, f]);
  });
  it('throws an error when a cycle is found', () => {
    const cyclical = {
      ...nodes,
      [f]: {
        value: f,
        name: f,
        children: [a],
      },
    };
    expect(topologicalSort.bind({}, initialNode, cyclical))
      .to.throw((new CircularDependencyError(f, a)).message);
  });
  it('excludes values that are not children of any node', () => {
    const unreachable = {
      ...nodes,
      [g]: {
        value: g,
        name: g,
        children: [a, b],
      },
    };
    expect(topologicalSort(initialNode, unreachable))
      .to.deep.equal([a, b, c, d, e, f]);
  });
});

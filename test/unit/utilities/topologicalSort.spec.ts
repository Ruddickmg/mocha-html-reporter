import { expect } from 'chai';
import { topologicalSort, Node, CircularDependencyError } from '../../../src/utilities/topologicalSort';

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
    name: a,
    children: [b, f],
  },
  [b]: {
    value: b,
    name: b,
    children: [c, d],
  },
  [c]: {
    value: c,
    name: c,
    children: [e],
  },
  [d]: {
    value: d,
    name: d,
    children: [e],
  },
  [e]: {
    value: e,
    name: e,
    children: [f],
  },
  [f]: {
    value: f,
    name: f,
    children: [],
  },
};

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

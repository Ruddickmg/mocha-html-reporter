import { expect } from 'chai';
import {
  elementCreator,
  getElementById,
  replaceElementById,
} from '../../../src/scripts/elements';

describe('elements', (): void => {
  const tag = 'div';
  const id = 'sweetId';
  describe('getElementById', (): void => {
    it('Will get an element by it\'s id', (): void => {
      const element = document.createElement('tag');
      element.setAttribute('id', id);
      document.body.appendChild(element);
      expect(getElementById(id)).to.equal(element);
    });
  });
  describe('replaceElementById', (): void => {
    const createDiv = elementCreator(tag);
    const element = createDiv({ id });
    const replacement = createDiv({ id });
    document.appendChild(element);
    replaceElementById(id, replacement);
    expect(document.getElementById(id)).to.equal(replacement);
  });
  describe('createElement', (): void => {
    it('Will create an element "creator" with the specified tag', (): void => {
      expect(elementCreator(tag)().tagName).to.equal(tag.toUpperCase());
    });
    it('Will add properties to a created element', (): void => {
      expect(elementCreator(tag)({ id }).id).to.equal(id);
    });
    it('Will add an array of elements to a created element', (): void => {
      const childElement1 = document.createElement(tag);
      const childElement2 = document.createElement(tag);
      const children = [childElement1, childElement2];
      expect(Array.from(elementCreator(tag)({}, children).children))
        .to.eql(children);
    });
    it('Will add text to a created element', (): void => {
      const text = 'Hello World!';
      expect(elementCreator(tag)({}, text).innerHTML)
        .to.eql(text);
    });
  });
});

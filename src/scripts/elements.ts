import { isArray } from '../utilities/typeChecks';
import {
  BUTTON_TAG,
  IMAGE_TAG,
  TABLE_DATA_TAG,
  TABLE_HEADER_TAG,
  TABLE_ROW_TAG,
  TABLE_TAG,
} from '../constants/html';

export interface ElementProperties {
  [property: string]: string;
}

export type ElementCreator = (
  properties?: ElementProperties,
  content?: string | Element[],
) => Element;

export const getElementById = (id: string): Element => document.getElementById(id);

export const replaceElementById = (id: string, replacement: Element): Element => {
  const element = getElementById(id);
  const parent = element.parentNode;
  parent.replaceChild(replacement, element);
  return replacement;
};

export const elementCreator = (
  tagName: string,
): ElementCreator => (
  properties?: ElementProperties,
  content?: string | Element[],
): Element => {
  const element = document.createElement(tagName);
  if (properties) {
    Object.keys(properties)
      .forEach((property: string): void => {
        element.setAttribute(property, properties[property]);
      });
  }
  if (content) {
    if (isArray(content)) {
      (content as Element[])
        .forEach((childElement: Element): void => {
          element.appendChild(childElement);
        });
    } else {
      element.innerHTML = content as string;
    }
  }
  return element;
};

export const createButton = elementCreator(BUTTON_TAG);
export const createImage = elementCreator(IMAGE_TAG);
export const createTable = elementCreator(TABLE_TAG);
export const createTableData = elementCreator(TABLE_DATA_TAG);
export const createTableRow = elementCreator(TABLE_ROW_TAG);
export const createTableHeader = elementCreator(TABLE_HEADER_TAG);

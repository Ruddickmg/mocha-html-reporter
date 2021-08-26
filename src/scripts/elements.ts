import { FAILED_BUTTON_ID, PASSED_BUTTON_ID } from './constants';

export const getElementById = (id: string): Element => document.getElementById(id);

export const getFailedButton = (): Element => getElementById(FAILED_BUTTON_ID);
export const getPassedButton = (): Element => getElementById(PASSED_BUTTON_ID);

export const getElementsByClasses = (...cssClasses: string[]): Element[] => {
  const listOfElements = document.body.querySelectorAll(
    cssClasses
      .map((cssClass: string): string => `.${cssClass}`)
      .join(''),
  );
  return listOfElements ? Array.from(listOfElements) : [];
};

export const moveToElementById = (id: string): void => {
  const pixelsToMoveUp = 80;
  const pixelsToMoveRight = 0;
  // eslint-disable-next-line no-restricted-globals
  location.href = `#${id}`;
  window.scrollBy(
    pixelsToMoveRight,
    -pixelsToMoveUp,
  );
};

export enum TagName {
  li = 'li',
  ul = 'ul',
  div = 'div',
  h1 = 'h1',
  h2 = 'h2',
  h3 = 'h3',
  h4 = 'h4',
  image = 'img',
  tableRow = 'tr',
  tableData = 'td',
  button = 'button',
  table = 'table',
}

export const createElement = (tag: TagName, options?: ElementCreationOptions): Element => document
  .createElement(tag, options);

export const getChildOfElement = (id: string, childClass: string): Element => {
  const element = getElementById(id);
  return element
    ? element.getElementsByClassName(childClass)[0]
    : {} as Element;
};

export const addClassToElement = (cssClass: string, element: Element): void => {
  if (element) {
    // eslint-disable-next-line no-param-reassign
    element.className = `${element.className} ${cssClass}`;
  }
};

export const removeClassFromElement = (cssClass: string, element: Element): void => {
  if (element) {
    // eslint-disable-next-line no-param-reassign
    element.className = element.className.replace(new RegExp(cssClass, 'g'), '');
  }
};

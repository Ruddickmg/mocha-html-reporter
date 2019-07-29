import { FAILED_BUTTON_ID, PASSED_BUTTON_ID } from '../constants/script';

export const getElementById = (id: string): Element => document.getElementById(id);

export const getFailedButton = () => getElementById(FAILED_BUTTON_ID);
export const getPassedButton = () => getElementById(PASSED_BUTTON_ID);

export const getElementsByClasses = (...cssClasses: string[]): Element[] => {
  const listOfElements = document.body.querySelectorAll(
    cssClasses
      .map(cssClass => `.${cssClass}`)
      .join(''),
  );
  return listOfElements ? Array.from(listOfElements) : [];
};

export const moveToElementById = (id: string): void => {
  const pixelsToMoveUp = 80;
  const pixelsToMoveRight = 0;
  location.href = `#${id}`;
  window.scrollBy(
    pixelsToMoveRight,
    -pixelsToMoveUp,
  );
};

export const getChildOfElement = (id: string, childClass: string): Element => {
  const element = getElementById(id);
  return element
    ? element.getElementsByClassName(childClass)[0]
    : {} as Element;
};

export const addClassToElement = (cssClass: string, element: Element): void => {
  if (element) {
    element.className = `${element.className} ${cssClass}`;
  }
};

export const removeClassFromElement = (cssClass: string, element: Element): void => {
  if (element) {
    element.className = element.className.replace(new RegExp(cssClass, 'g'), '');
  }
};

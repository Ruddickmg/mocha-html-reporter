import {
  addClassToElement,
  getChildOfElement,
  getFailedButton,
  getPassedButton,
  removeClassFromElement,
} from './elements';
import { VISIBLE } from './constants';

export const activateElement = (
  element: Element,
): void => addClassToElement(VISIBLE, element);

export const deactivateElement = (
  element: Element,
): void => removeClassFromElement(VISIBLE, element);

export const activateFailedButton = () => activateElement(getFailedButton());
export const deactivateFailedButton = () => deactivateElement(getFailedButton());

export const activatePassedButton = () => activateElement(getPassedButton());
export const deactivatePassedButton = () => deactivateElement(getPassedButton());

export const activateChildAndButton = (id: string, childClass: string) => [childClass, `${childClass}-button`]
  .forEach((cssClass: string): void => activateElement(getChildOfElement(id, cssClass)));

export const deactivateChildAndButton = (id: string, childClass: string): void => [childClass, `${childClass}-button`]
  .forEach((cssClass) => deactivateElement(getChildOfElement(id, cssClass)));

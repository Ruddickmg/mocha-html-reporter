import {
  addClassToElement,
  getElementById,
  getElementsByClasses,
  removeClassFromElement,
} from "./elements";
import {
  FAILED,
  HIDDEN,
  HISTORY,
  IMAGE,
  MESSAGE,
  PASSED,
  STACK,
  TEST_DATA,
} from "../constants/script";
import { getCurrentPage } from "./navigation";
import {activateChildAndButton, deactivateChildAndButton,} from "./activation";

export const hideElement = (element: Element): void => addClassToElement(HIDDEN, element);
export const showElement = (element: Element): void => removeClassFromElement(HIDDEN, element);

export const showByClassOnCurrentPage = (cssClass: string): void => getElementsByClasses(cssClass, getCurrentPage())
  .forEach(showElement);

export const hideByClassOnCurrentPage = (cssClass: string): void => getElementsByClasses(cssClass, getCurrentPage())
  .forEach(hideElement);

export const showById = (id: string): void => showElement(getElementById(id));
export const hideById = (id: string): void => hideElement(getElementById(id));
export const hideTestSuite = (): void => hideById(TEST_DATA);
export const showTestSuit = (): void => showById(TEST_DATA);
export const hideHistory = (): void => hideById(HISTORY);
export const showHistory = (): void => showById(HISTORY);

export const hideAllTestsOnCurrentPage = (): void => [PASSED, FAILED]
  .forEach(testType => hideByClassOnCurrentPage(testType));

export const showStack = (id: string): void => activateChildAndButton(id, STACK);
export const showImage = (id: string): void => activateChildAndButton(id, IMAGE);
export const showMessage = (id: string): void => activateChildAndButton(id, MESSAGE);

export const hideStack = (id: string): void => deactivateChildAndButton(id, STACK);
export const hideImage = (id: string): void => deactivateChildAndButton(id, IMAGE);
export const hideMessage = (id: string): void => deactivateChildAndButton(id, MESSAGE);
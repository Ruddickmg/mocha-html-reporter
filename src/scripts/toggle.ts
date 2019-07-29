import {
  hideByClassOnCurrentPage,
  hideImage,
  hideMessage,
  hideStack,
  showByClassOnCurrentPage,
  showImage,
  showMessage,
  showStack,
} from './visibility';
import {
  activateFailedButton,
  activatePassedButton,
  deactivateFailedButton,
  deactivatePassedButton,
} from './activation';
import {
  FAILED,
  IMAGE,
  MESSAGE,
  PASSED,
  SHOWING_FAILED,
  SHOWING_PASSED,
  STACK,
} from '../constants/script';
import {
  isShowing,
  setVisibility,
} from './navigation';

export const toggle = (state: string): boolean | string => {
  const result = !isShowing(state);
  setVisibility(state, result);
  return result;
};

export const toggleFailedTests = (): boolean => {
  if (toggle(SHOWING_FAILED)) {
    showByClassOnCurrentPage(FAILED);
    activateFailedButton();
  } else {
    hideByClassOnCurrentPage(FAILED);
    deactivateFailedButton();
  }
  return false;
};

export const togglePassedTests = (): boolean => {
  if (toggle(SHOWING_PASSED)) {
    showByClassOnCurrentPage(PASSED);
    activatePassedButton();
  } else {
    hideByClassOnCurrentPage(PASSED);
    deactivatePassedButton();
  }
  return false;
};

export const toggleStack = (id: string): boolean => {
  if (toggle(`${STACK}-${id}`)) {
    showStack(id);
  } else {
    hideStack(id);
  }
  return false;
};

export const toggleImage = (id: string): boolean => {
  if (toggle(`${IMAGE}-${id}`)) {
    showImage(id);
  } else {
    hideImage(id);
  }
  return false;
};

export const toggleMessage = (id: string): boolean => {
  if (toggle(`${MESSAGE}-${id}`)) {
    showMessage(id);
  } else {
    hideMessage(id);
  }
  return false;
};

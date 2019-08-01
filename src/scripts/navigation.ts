import {
  FAILED,
  PASSED,
  SHOWING_FAILED,
  SHOWING_PASSED,
} from './constants';
import {
  hideAllTestsOnCurrentPage,
  hideHistory,
  hideTestSuite,
  showByClassOnCurrentPage,
  showHistory,
  showTestSuit,
} from './visibility';
import { moveToElementById } from './elements';

interface ShowingRecord {
  [field: string]: boolean | string;
}

let currentPage: string;

export const fieldsBeingShown: ShowingRecord = {
  [SHOWING_PASSED]: true,
  [SHOWING_FAILED]: true,
};

export const isShowing = (field: string): boolean | string => fieldsBeingShown[field];
export const setVisibility = (field: string, showing: boolean): void => {
  fieldsBeingShown[field] = showing;
};

export const getCurrentPage = (): string => currentPage;

export const switchToPage = (testRunId: string, testSuiteId: string): boolean => {
  [hideAllTestsOnCurrentPage, hideHistory, showTestSuit]
    .forEach(method => method());
  currentPage = testRunId;
  [
    [fieldsBeingShown[SHOWING_FAILED], FAILED],
    [fieldsBeingShown[SHOWING_PASSED], PASSED],
  ].forEach(([active, cssClass]) => active
    && showByClassOnCurrentPage(cssClass as string));
  moveToElementById(testSuiteId);
  return false;
};

export const moveToHistory = () => {
  [hideTestSuite, showHistory]
    .forEach(method => method());
  return false;
};

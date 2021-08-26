import {
  toggleFailedTests,
  toggleImage,
  toggleMessage,
  togglePassedTests,
  toggleStack,
} from './toggle';
import { moveToHistory, switchToPage } from './navigation';
import { getElementById } from './elements';
import { DATA_ELEMENT } from './constants';
import {
  convertHistoryToHtml,
  TestResult,
} from './formatting/html';
import { formatHistory } from './formatting/history';

type PageAction = (...data: string[]) => void | boolean;

interface PageActions{
  [method: string]: PageAction;
}

export default ((binding: PageActions): Element => {
  const publicMethods: PageActions = {
    toggleMessage,
    toggleImage,
    toggleStack,
    toggleFailedTests,
    togglePassedTests,
    switchToPage,
    moveToHistory,
  };
  const dataContainer = getElementById(DATA_ELEMENT);
  const data: TestResult[] = JSON.parse((dataContainer || {}).innerHTML || '[]');
  const history = formatHistory(data);
  Object.keys(publicMethods)
    .forEach((methodName: string): void => {
      // eslint-disable-next-line no-param-reassign
      binding[methodName] = publicMethods[methodName];
    });
  return document.body.appendChild(convertHistoryToHtml(history));
})(window as unknown as PageActions);

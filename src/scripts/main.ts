import {
  toggleFailedTests, toggleImage, toggleMessage, togglePassedTests, toggleStack,
} from './toggle';
import { moveToHistory, switchToPage } from './navigation';
import { getElementById } from './elements';
import { DATA_ELEMENT } from './constants';
import { convertSuitesToHtml } from './formatting/html';

type PageAction = (...data: string[]) => void | boolean;

interface PageActions {
  [method: string]: PageAction;
}

export default ((binding: PageActions): void => {
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
  const data = JSON.parse((dataContainer || {}).innerHTML || '[]');
  console.log('it works!', data);
  convertSuitesToHtml(data);
  Object.keys(publicMethods)
    .forEach((methodName: string): void => {
      // eslint-disable-next-line no-param-reassign
      binding[methodName] = publicMethods[methodName];
    });
  // convertHistoryToHtml(data);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
})(window);

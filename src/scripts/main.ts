import {
  toggleFailedTests, toggleImage, toggleMessage, togglePassedTests, toggleStack,
} from './toggle';
import { moveToHistory, switchToPage } from './navigation';
import { getElementById } from './elements';
import { DATA_ELEMENT } from './constants';

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
  const data = (dataContainer || {}).innerHTML || '[]';
  console.log('it works!', JSON.parse(data));
  Object.keys(publicMethods)
    .forEach((methodName: string): void => {
      // eslint-disable-next-line no-param-reassign
      binding[methodName] = publicMethods[methodName];
    });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
})(window);

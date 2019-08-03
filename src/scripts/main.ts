import {
  toggleFailedTests, toggleImage, toggleMessage, togglePassedTests, toggleStack,
} from './toggle';
import { moveToHistory, switchToPage } from './navigation';

type PageAction = (...data: string[]) => void | boolean;

interface PageActions {
  [method: string]: PageAction;
}

export default (binding: PageActions): void => {
  const publicMethods: PageActions = {
    toggleMessage,
    toggleImage,
    toggleStack,
    toggleFailedTests,
    togglePassedTests,
    switchToPage,
    moveToHistory,
  };
  Object.keys(publicMethods)
    .forEach((methodName: string): void => {
      // eslint-disable-next-line no-param-reassign
      binding[methodName] = publicMethods[methodName];
    });
};

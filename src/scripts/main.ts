import { transform } from '@babel/core';
import {
  toggleFailedTests,
  toggleImage,
  toggleMessage,
  toggleStack,
  togglePassedTests,
} from "./toggle";
import {
  switchToPage,
  moveToHistory
} from "./navigation";

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
    .forEach((methodName) => {
      binding[methodName] = publicMethods[methodName];
    });
};

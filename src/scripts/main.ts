import { replaceElementById } from './elements';
import { HISTORY_TABLE } from '../constants/cssIdentifiers';
import { getHistoryTable } from './historyPage/history';

type PageAction = (...data: string[]) => void | boolean;

interface PageActions {
  [method: string]: PageAction;
}

export default ((binding: Window): void => {
  const publicMethods: PageActions = {};
  const methodNames: string[] = Object.keys(publicMethods);
  const historyTable: Element = getHistoryTable();
  replaceElementById(HISTORY_TABLE, historyTable);
  console.log('working!');
  methodNames
    .forEach((methodName: string): void => {
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      binding[methodName] = publicMethods[methodName];
    });
  // @ts-ignore
})(window);

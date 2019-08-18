import { HistoryByDate } from '../../types/report';
import { getElementById } from '../elements';
import { DATA } from '../../constants/cssIdentifiers';
import { formatHistory } from './formatHistory';
import { createHistoryTable } from './createHistoryTable';
import { compose } from '../../utilities/functions';

export const getHistoryData = (): HistoryByDate => {
  const dataElement = getElementById(DATA);
  return dataElement
    ? JSON.parse(dataElement.innerHTML)
    : {};
};

export const getHistoryTable = compose(
  getHistoryData,
  formatHistory,
  createHistoryTable,
);

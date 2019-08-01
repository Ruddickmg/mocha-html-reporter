import chalk from 'chalk';
import { capitalizeFirstLetter } from './strings';

export type Logger = (...text: any[]) => void;

const logger = (color: any): Logger => (...text: any[]): void => console.log(color(capitalizeFirstLetter(text.join(' '))));
export const logError = logger(chalk.bold.red);
export const logWarning = logger(chalk.yellow);
export const logPass = logger(chalk.green);
export const logFail = logger(chalk.red);
export const logMessage = logger(chalk.blueBright);

import chalk from 'chalk';

export const DEFAULT_SERVER_HOST = 'localhost';
export const DEFAULT_SERVER_PORT = 3000;

export const LOG_PREFIX = {
  INFO: chalk.green.bold('[FastAct]'),
  WARN: chalk.yellow.bold('[FastAct]'),
  ERROR: chalk.red.bold('[FastAct]'),
} as const;

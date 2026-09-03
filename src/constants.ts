import chalk from 'chalk';

export const DEFAULT_SERVER_HOST = 'localhost';
export const DEFAULT_SERVER_PORT = 3000;

export const LOG_PREFIX = {
  INFO: chalk.green.bold('[fastact]'),
  WARN: chalk.yellow.bold('[fastact]'),
  ERROR: chalk.red.bold('[fastact]'),
} as const;

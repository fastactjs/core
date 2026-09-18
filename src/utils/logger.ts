const RESET = '\x1b[0m';
const BOLD_YELLOW = '\x1b[1;33m';
const BOLD_RED = '\x1b[1;31m';
const BOLD_GREEN = '\x1b[1;32m';

export const logger = {
  warn(message: string) {
    console.warn(`${BOLD_YELLOW}[FastAct]${RESET} ${message}`);
  },
  error(message: string, error?: any) {
    const errMessage =
      error instanceof Error ? error.message : String(error || '');
    const suffix = errMessage ? `: ${errMessage}` : '';
    console.error(`${BOLD_RED}[FastAct]${RESET} ${message}${suffix}`);
  },
  info(message: string) {
    console.log(`${BOLD_GREEN}[FastAct]${RESET} ${message}`);
  },
};

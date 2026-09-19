/** ANSI escape codes for terminal styling. */
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const COLORS = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
} as const;

/**
 * Creates a colored tag for logging.
 * 
 * @param colorCode - ANSI color code.
 * @returns formatted colored tag string.
 */
function createTag(colorCode: string): string {
  return `${BOLD}${colorCode}[FastAct]${RESET}`;
}

/** Predefined colored tags for different logging levels. */
export const colorTag = {
  INFO: createTag(COLORS.cyan),
  WARN: createTag(COLORS.yellow),
  ERROR: createTag(COLORS.red),
  SUCCESS: createTag(COLORS.green),
  DEBUG: createTag(COLORS.gray),
} as const;

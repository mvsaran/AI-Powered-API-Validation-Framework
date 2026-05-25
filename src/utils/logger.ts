import env from '../config/environment';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  private currentLevelValue: number;

  constructor() {
    const level: LogLevel = env.logLevel || 'INFO';
    this.currentLevelValue = LOG_LEVEL_VALUES[level] ?? 1;
  }

  private log(level: LogLevel, message: string, ...optionalParams: any[]) {
    if (LOG_LEVEL_VALUES[level] >= this.currentLevelValue) {
      const timestamp = new Date().toISOString();
      const formattedMessage = `[${timestamp}] [${level}] ${message}`;
      
      switch (level) {
        case 'DEBUG':
          console.debug(formattedMessage, ...optionalParams);
          break;
        case 'INFO':
          console.info(formattedMessage, ...optionalParams);
          break;
        case 'WARN':
          console.warn(formattedMessage, ...optionalParams);
          break;
        case 'ERROR':
          console.error(formattedMessage, ...optionalParams);
          break;
      }
    }
  }

  debug(message: string, ...optionalParams: any[]) {
    this.log('DEBUG', message, ...optionalParams);
  }

  info(message: string, ...optionalParams: any[]) {
    this.log('INFO', message, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]) {
    this.log('WARN', message, ...optionalParams);
  }

  error(message: string, ...optionalParams: any[]) {
    this.log('ERROR', message, ...optionalParams);
  }
}

export const logger = new Logger();
export default logger;

/**
 * Centralized logging service for the application
 * Provides consistent logging across all modules
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logs: LogEntry[] = [];

  private toLogRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    if (value === undefined) {
      return {};
    }

    return { data: value };
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string): string {
    return `[${this.formatTimestamp()}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message), data);
    }
    this.store('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    console.info(this.formatMessage('info', message), data);
    this.store('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message), data);
    }
    this.store('warn', message, data);
  }

  error(message: string, error?: unknown, data?: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const payload = {
      error: errorMessage,
      ...this.toLogRecord(data)
    };
    console.error(this.formatMessage('error', message), payload);
    this.store('error', message, payload);
  }

  private store(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      data
    };
    this.logs.push(entry);
    
    // Keep only last 100 logs in memory
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();

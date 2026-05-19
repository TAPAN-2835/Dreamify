// server/config/logger.js
import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'dreamify-api' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const extras = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${level}] ${message} ${extras}`;
        })
      )
    }),
    ...(process.env.NODE_ENV === 'production' ? [
      new transports.File({ filename: path.join(__dirname, '../../logs/error.log'),   level: 'error' }),
      new transports.File({ filename: path.join(__dirname, '../../logs/combined.log') }),
    ] : [])
  ]
});

export default logger;

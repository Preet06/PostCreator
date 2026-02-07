const winston = require('winston');

/**
 * Centralized Logger Configuration
 * Uses Winston to provide structured logging.
 * Logs are automatically picked up by Application Insights (configured in appInsights.js).
 */

const { combine, timestamp, json, colorize, printf } = winston.format;

// Custom format for console (readable)
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp(),
        json() // Machine-readable for logs files/monitoring
    ),
    defaultMeta: { service: 'post-creator' },
    transports: [
        // 1. Console Transport (with colors for development)
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'HH:mm:ss' }),
                consoleFormat
            ),
        }),
    ],
});

// If we're in production, we could add file transports here
// but for Azure, we rely on App Insights and Container/App Service logs.

module.exports = logger;

// src/config/logging.js

import winston from 'winston';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

const enumerateErrorFormat = winston.format(info => {
    if (info instanceof Error) {
        return { ...info, message: info.stack };
    }
    return info;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        enumerateErrorFormat(),
        process.env.NODE_ENV === 'development'
            ? winston.format.colorize()
            : winston.format.uncolorize(),
        winston.format.splat(),
        winston.format.timestamp(),
        winston.format.printf(
            ({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`
        )
    ),
    transports: [
        new winston.transports.Console(),
        new LogtailTransport(logtail),
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' })
    ]
});

export const requestLogger = (req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        user: req.user?.id,
        body: req.body
    });
    next();
};

export const queryLogger = (query) => {
    logger.debug(`MongoDB Query: ${query.collection}.${query.method}`, {
        duration: query.duration,
        operation: query.op,
        criteria: query.conditions
    });
};

export default logger;
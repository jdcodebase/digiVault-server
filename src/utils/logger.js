import winston from 'winston';
import env from '../config/env.js';

const isDevelopment = env.NODE_ENV === 'development';

const redact = winston.format((info) => {
    const sensitiveFields = ['password', 'token'];

    const scrubSensitiveData = (obj) => {
        if(typeof obj !== 'object' || obj === null) {
            return obj;
        }

        for(const key of Object.keys(obj)) {
            if(sensitiveFields.includes(key.toLowerCase())) {
                obj[key] = '[REDACTED]';
            } else if(typeof obj[key] === 'object') {
                obj[key] = scrubSensitiveData(obj[key]);
            }
        }
        return obj;
    }   

    return scrubSensitiveData(info);        
});

const logger = winston.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    format: winston.format.combine(
        redact(),
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.errors({ stack: true }),
        isDevelopment ? winston.format.prettyPrint() : winston.format.json(),
    ),
    defaultMeta: { service: 'digiVault-server' },
    transports: [
        new winston.transports.Console({
            format: isDevelopment ? winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ) : winston.format.json()
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' })
    ]
})

export default logger;
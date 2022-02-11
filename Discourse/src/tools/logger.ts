import pino from 'pino';

export const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    timestamp: () => `,"@timestamp":"${new Date(Date.now()).toISOString()}"`,
    messageKey: 'message',
    base: {
        pid: process.pid
    },
    formatters: {
        level: (label: string) => {
            return { level: label.toUpperCase() };
        }
    },
    mixin() {
        return { AppType: 'Discourse' };
    },
    redact: { paths: ['attributes.password'], censor: '****' }
});
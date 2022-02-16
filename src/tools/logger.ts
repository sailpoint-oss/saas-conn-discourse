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
    // Remove any json path attributes that might contain sensitive information
    redact: { paths: ['attributes.password', 'attributes.username', 'password', 'username', 'ip_address', 'registration_ip_address', '*.password', '*.username', '*.ip_address', '*.registration_ip_address'], censor: '****' }
});
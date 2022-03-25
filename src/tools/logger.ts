import { logger as SDKLogger } from '@sailpoint/connector-sdk'

export const logger = SDKLogger.child(
    { connectorName: 'Discourse' },
    {
        redact: {
            paths: [
                'attributes.password',
                'attributes.username',
                'password',
                'username',
                'ip_address',
                'registration_ip_address',
                '*.password',
                '*.username',
                '*.ip_address',
                '*.registration_ip_address',
            ],
            censor: '****',
        },
    }
)

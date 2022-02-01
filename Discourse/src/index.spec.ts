import { connector } from './index'
import { StandardCommand } from '@sailpoint/connector-sdk'
import { PassThrough } from 'stream'
import { Config } from './model/config'

jest.mock('./discourse-client')

const mockConfig: Config = {
    apiKey: 'xxx',
    apiUsername: 'user',
    baseUrl: 'url',
    primaryGroup: 'group'
}
process.env.CONNECTOR_CONFIG = Buffer.from(JSON.stringify(mockConfig)).toString('base64')

describe('connector unit tests', () => {

    it('connector SDK major version should be 0', async () => {
        const version = (await connector()).sdkVersion;
        expect(version).toStrictEqual(0);
    })

    it('should execute stdTestConnectionHandler', async () => {
        await (await connector())._exec(
            StandardCommand.StdTestConnection,
            {},
            undefined,
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk).toStrictEqual({}))
        )
    })
})

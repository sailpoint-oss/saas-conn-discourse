import { connector } from './index'
import { StandardCommand, StdAccountUpdateInput } from '@sailpoint/connector-sdk'
import { PassThrough } from 'stream'
import { Config } from './model/config'
import {Util} from './util'

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

    it('should execute stdAccountCreate', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountCreate,
            {},
            {"attributes": {"username": "test"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk.identity).toStrictEqual("1305"))
        )
    })

    it('should execute stdAccountList', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountList,
            {},
            {"attributes": {"username": "test"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk.identity).toStrictEqual("100"))
        )
    })

    it('should execute stdAccountRead', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountRead,
            {},
            {"attributes": {"username": "test"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk.identity).toStrictEqual("1305"))
        )
    })

    it('should execute stdAccountUpdate add', async () => {
        const spy = jest.spyOn(Util.prototype, "accountAdd")
        await (await connector())._exec(
            StandardCommand.StdAccountUpdate,
            {},
            {"attributes": {"identity": "test"}, "changes": [{"op": "Add","attribute": "", "value": "" }]},
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(spy).toBeCalled())
        )
    })

    it('should execute stdAccountUpdate remove', async () => {
        const spy = jest.spyOn(Util.prototype, "accountRemove")
        await (await connector())._exec(
            StandardCommand.StdAccountUpdate,
            {},
            {"attributes": {"identity": "test"}, "changes": [{"op": "Remove","attribute": "", "value": "" }]},
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(spy).toBeCalled())
        )
    })
})

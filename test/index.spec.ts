import { connector } from '../src/index'
import { StandardCommand, StdAccountUpdateInput } from '@sailpoint/connector-sdk'
import { PassThrough } from 'stream'
import { Config } from '../src/model/config'
import { Util } from '../src/tools/util'

jest.mock('../src/discourse-client')

const mockConfig: Config = {
    apiKey: 'xxx',
    apiUsername: 'user',
    baseUrl: 'url',
    primaryGroup: 'group'
}
process.env.CONNECTOR_CONFIG = Buffer.from(JSON.stringify(mockConfig)).toString('base64')

describe('connector unit tests', () => {

    it('connector SDK major version should be 1', async () => {
        const version = (await connector()).sdkVersion;
        expect(version).toStrictEqual(1);
    })

    it('should execute stdTestConnectionHandler', async () => {
        await (await connector())._exec(
            StandardCommand.StdTestConnection,
            {},
            undefined,
            new PassThrough({ objectMode: true }).on('data', (chunk) => 
            expect(chunk.data).toStrictEqual({}))
        )
    })

    it('should execute stdAccountCreate', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountCreate,
            {"id": "0"},
            {"attributes": {"username": "test", "password": "1234"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => 
            expect(chunk.data.identity).toStrictEqual("1305"))
        )
    })

    it('should execute stdAccountList', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountList,
            {},
            {"attributes": {"username": "test"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => 
            expect(chunk.data.identity).toStrictEqual("100"))
        )
    })

    it('should execute stdAccountRead', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountRead,
            {},
            {"attributes": {"username": "test"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => 
            expect(chunk.data.identity).toStrictEqual("1305"))
        )
    })

    it('should execute stdAccountUpdate add', async () => {
        const spy = jest.spyOn(Util.prototype, "accountAdd")
        await (await connector())._exec(
            StandardCommand.StdAccountUpdate,
            {},
            {
                "identity": "100",
                "changes": [
                    {
                        "op": "Add",
                        "attribute": "",
                        "value": ""
                    }
                ]
            },
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(spy).toBeCalled())
        )
    })

    it('should execute stdAccountUpdate remove', async () => {
        const spy = jest.spyOn(Util.prototype, "accountRemove")
        await (await connector())._exec(
            StandardCommand.StdAccountUpdate,
            {},
            {
                "identity": "100",
                "changes": [
                    {
                        "op": "Remove",
                        "attribute": "",
                        "value": ""
                    }
                ]
            },
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(spy).toBeCalled())
        )
    })

    it('should execute stdAccountUpdate set', async () => {
        const spy = jest.spyOn(Util.prototype, "accountSet")
        await (await connector())._exec(
            StandardCommand.StdAccountUpdate,
            {},
            {
                "identity": "100",
                "changes": [
                    {
                        "op": "Set",
                        "attribute": "",
                        "value": ""
                    }
                ]
            },
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(spy).toBeCalled())
        )
    })

    it('should execute stdAccountDelete', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountDelete,
            {},
            {"attributes": {"identity": "test"}, "changes": [{"op": "Add","attribute": "", "value": "" }]},
            new PassThrough({ objectMode: true }).on('data', (chunk) => 
            expect(chunk.data).toStrictEqual({}))
        )
    })

    it('should execute stdEntitlementList', async () => {
        await (await connector())._exec(
            StandardCommand.StdEntitlementList,
            {},
            {"attributes": {"identity": "test"}, "changes": [{"op": "Add","attribute": "", "value": "" }]},
            new PassThrough({ objectMode: true }).on('data', (chunk) => 
            expect(chunk.data).toStrictEqual({"attributes": {"id": "1:admins","name": "admins",},"identity": "1:admins", "type":"group", "uuid": "1:admins",}))
        )
    })

    it('should execute stdEntitlementRead', async () => {
        await (await connector())._exec(
            StandardCommand.StdEntitlementRead,
            {},
            {"attributes": {"identity": "test"}, "changes": [{"op": "Add","attribute": "", "value": "" }]},
            new PassThrough({ objectMode: true }).on('data', (chunk) => 
            expect(chunk.data).toStrictEqual({"attributes": {"id": "1:admins", "name": "admins",},"identity": "1:admins", "type":"group", "uuid": "1:admins",}))
        )
    })
})

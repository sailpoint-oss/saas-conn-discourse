import { ConnectorError, StandardCommand } from '@sailpoint/connector-sdk'
import { DiscourseClient } from './discourse-client'

const mockConfig: any = {
    token: 'xxx123'
}

describe('connector client unit tests', () => {

    const discourseClient = new DiscourseClient(mockConfig)

    it('connector client list accounts', async () => {
        let allAccounts = await discourseClient.getAllAccounts()
        expect(allAccounts.length).toStrictEqual(2)
    })

    it('connector client get account', async () => {
        let account = await discourseClient.getAccount('john.doe')
        expect(account.username).toStrictEqual('john.doe')
    })

    it('connector client test connection', async () => {
        expect(await discourseClient.testConnection()).toStrictEqual({})
    })

    it('connector client test connection', async () => {
        expect(await discourseClient.testConnection()).toStrictEqual({})
    })

    it('invalid connector client', async () => {
        try {
            new DiscourseClient({})
        } catch (e) {
            expect(e instanceof ConnectorError).toBeTruthy()
        }
    })
})

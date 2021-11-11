import { ConnectorError, StandardCommand } from '@sailpoint/connector-sdk'
import { DiscourseClient } from './discourse-client'
import { User } from './model/user'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
let discourseClient = new DiscourseClient({apiKey: 'company', apiUsername: 'apiKey', baseUrl: 'baseUrl'})
discourseClient.httpClient = mockedAxios

let userIdentity = 1
let user = new User()
user.id = userIdentity
user.username = 'john.doe'
user.title = 'admin'
user.email = 'john.doe@test.com'

// let roleIdentity = '456'
// let role = new Role()
// role.id = 456
// role.name = 'Engineer'
// role.description = 'Engineering role'

describe('test happy paths', () => {
    it('test connection', async () => {
        mockedAxios.get.mockResolvedValueOnce({})

        let res = await discourseClient.testConnection()

        expect(res).toStrictEqual({})
	})

    it('get users', async () => {
        mockedAxios.get.mockResolvedValueOnce({data: [user]})
        
        let res = await discourseClient.getUsers()

        expect(res.length).toBe(1)
        expect(res).toStrictEqual([user])
	})

    it('get user', async () => {
        mockedAxios.get.mockResolvedValueOnce({data: user})
        
        let res = await discourseClient.getUser(userIdentity)

        expect(res).toStrictEqual(user)
	})

})

describe('test exception', () => {
	it('create client with invalid config', async () => {
        try {
            new DiscourseClient({apiKey: 'apiKey'})
		} catch (e) {
			expect(e instanceof ConnectorError).toBeTruthy()
		}

        try {
            new DiscourseClient({apiUsername: 'apiUsername'})
		} catch (e) {
			expect(e instanceof ConnectorError).toBeTruthy()
		}
	})

	it('list user with invalid result', async () => {
        try {
            mockedAxios.get.mockResolvedValueOnce({data: {}})
            await discourseClient.getUsers()
		} catch (e) {
			expect(e instanceof ConnectorError).toBeTruthy()
		}
	})
})

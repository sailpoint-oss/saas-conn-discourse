import { ConnectorError } from '@sailpoint/connector-sdk'
import { DiscourseClient } from '../src/discourse-client'

jest.mock('../src/http/axios-wrapper')
const discourseClient = new DiscourseClient({ apiKey: 'company', apiUsername: 'apiKey', baseUrl: 'baseUrl', primaryGroup: 'group' })


describe('test happy paths', () => {
  it('test connection', async () => {

    const res = await discourseClient.testConnection()

    expect(res).toStrictEqual({})
  })

  it('get users populates correct fields', async () => {
    const res = await discourseClient.getUsers()

    expect(res.length).toBe(2)
    expect(res[0].email === 'test.test@test.com')
  })

  it('get user returns correct email', async () => {
    let res = await discourseClient.getUser('100')

    expect(res.email === 'test.test@test.com')

    res = await discourseClient.getUser('1305')

    expect(res.email === 'test2.test2@test2.com')
  })

  it('create user returns correct email', async () => {
    const spy = jest.spyOn(DiscourseClient.prototype as any, "generateRandomPassword")
    const res = await discourseClient.createUser({"id": 0, "email": "", "username": "test", "password": "12345test" })
    expect(spy).toBeCalledTimes(0);
    expect(res.email === 'test.test@test.com')
  })

  it('password is generated when not provided', async () => {
    const spy = jest.spyOn(DiscourseClient.prototype as any, "generateRandomPassword")
    const res = await discourseClient.createUser({"id": 0,  "email": "", "username": "test" })
    expect(spy).toBeCalled();
    expect(res.email === 'test.test@test.com')
  })

  it('get users populates correct fields', async () => {
    const res = await discourseClient.deleteUser("")

    expect(res).toStrictEqual({})
  })

})

describe('test exception', () => {
  it('create client with invalid config', async () => {
    try {
      new DiscourseClient({ apiUsername: 'apiKey', baseUrl: 'baseUrl', primaryGroup: 'group' })
    } catch (e) {
      expect(e instanceof ConnectorError).toBeTruthy()
    }

    try {
      new DiscourseClient({ apiKey: 'apiKey', baseUrl: 'baseUrl', primaryGroup: 'group' })
    } catch (e) {
      expect(e instanceof ConnectorError).toBeTruthy()
    }

    try {
      new DiscourseClient({ apiUsername: 'apiKey', apiKey: 'apiKey', baseUrl: 'baseUrl' })
    } catch (e) {
      expect(e instanceof ConnectorError).toBeTruthy()
    }

    try {
      new DiscourseClient({ apiUsername: 'apiKey', apiKey: 'apiKey', primaryGroup: 'group' })
    } catch (e) {
      expect(e instanceof ConnectorError).toBeTruthy()
    }
  })
})

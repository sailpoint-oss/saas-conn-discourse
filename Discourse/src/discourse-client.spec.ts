import { ConnectorError, StandardCommand } from '@sailpoint/connector-sdk'
import { DiscourseClient } from './discourse-client'
import { AxiosWrapper } from './axios-wrapper'
import user from './__mocks__/user.json'
import { hasUncaughtExceptionCaptureCallback } from 'process'

jest.mock('./axios-wrapper')
let discourseClient = new DiscourseClient({ apiKey: 'company', apiUsername: 'apiKey', baseUrl: 'baseUrl', primaryGroup: 'group' })


describe('test happy paths', () => {
  it('test connection', async () => {

    let res = await discourseClient.testConnection()

    expect(res).toStrictEqual({})
  })

  it('get users populates correct fields', async () => {
    let res = await discourseClient.getUsers()

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
    let res = await discourseClient.createUser({"email": "", "username": "test", "password": "12345test"})
    expect(spy).toBeCalledTimes(0);
    expect(res.email === 'test.test@test.com')
  })

  it('password is generated when not provided', async () => {
    const spy = jest.spyOn(DiscourseClient.prototype as any, "generateRandomPassword")
    let res = await discourseClient.createUser({"email": "", "username": "test"})
    expect(spy).toBeCalled();
    expect(res.email === 'test.test@test.com')

  })

  it('get users populates correct fields', async () => {
    let res = await discourseClient.deleteUser("")

    expect(res).toStrictEqual({})
  })

})

describe('test exception', () => {
  // it('create client with invalid config', async () => {
  //       try {
  //           new DiscourseClient({apiKey: 'apiKey',apiUsername: 'apiKey', baseUrl: 'baseUrl', primaryGroup: 'group'})
  // 	} catch (e) {
  // 		expect(e instanceof ConnectorError).toBeTruthy()
  // 	}

  //       try {
  //           new DiscourseClient({apiKey: 'apiKey',apiUsername: 'apiKey', baseUrl: 'baseUrl', primaryGroup: 'group'})
  // 	} catch (e) {
  // 		expect(e instanceof ConnectorError).toBeTruthy()
  // 	}
  // })

  // it('list user with invalid result', async () => {
  //       try {
  //           await discourseClient.getUsers()
  // 	} catch (e) {
  // 		expect(e instanceof ConnectorError).toBeTruthy()
  // 	}
  // })
})

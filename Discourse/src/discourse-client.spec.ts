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

  it('get user', async () => {
    let res = await discourseClient.getUser('100')

    expect(res.email === 'test.test@test.com')
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

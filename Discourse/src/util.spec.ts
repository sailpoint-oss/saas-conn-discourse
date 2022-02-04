import { ConnectorError, StandardCommand } from '@sailpoint/connector-sdk'
import { DiscourseClient } from './discourse-client'
import { AxiosWrapper } from './axios-wrapper'
import user from './__mocks__/user.json'
import { hasUncaughtExceptionCaptureCallback } from 'process'
import { Util } from './util'

jest.mock('./axios-wrapper')
let discourseClient = new DiscourseClient({ apiKey: 'company', apiUsername: 'apiKey', baseUrl: 'baseUrl', primaryGroup: 'group' })


describe('test happy paths', () => {
  it('accountToUser', async () => {
    const util = new Util
    let userGroup = {
        "attributes": {
            "username": "test",
            "groups":[
                "1:group"
            ],
            "email": "test@test.com",
            "title":"title",
            "password": "password"
        },
        "identity": "identity"
    }

    let res = util.accountToUser(userGroup)

    expect(res.email).toStrictEqual("test@test.com")
  })

})


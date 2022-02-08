import { AttributeChangeOp, ConnectorError, StandardCommand } from '@sailpoint/connector-sdk'
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

  it('accountRemove', async () => {
    const util = new Util
    let account = {
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


    let userGroup = {
      "op": AttributeChangeOp.Remove,
        "attribute": "groups",
        "value": ["1:group"]
    }

    util.accountRemove(userGroup, account)
    expect(account.attributes.groups.length).toBe(0)
  })

  it('accountRemove - no array', async () => {
    const util = new Util
    let account = {
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


    let userGroup = {
      "op": AttributeChangeOp.Remove,
        "attribute": "groups",
        "value": "1:group"
    }

    util.accountRemove(userGroup, account)
    expect(account.attributes.groups.length).toBe(0)
  })

  
  it('accountAdd', async () => {
    const util = new Util
    let account = {
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


    let userGroup = {
      "op": AttributeChangeOp.Add,
        "attribute": "groups",
        "value": ["2:groups"]
    }

    util.accountAdd(account, userGroup)
    expect(account.attributes.groups.length).toBe(2)
    expect(account.attributes.groups[1]).toBe('2:groups')
  })

  it('accountAdd - no Array', async () => {
    const util = new Util
    let account = {
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


    let userGroup = {
      "op": AttributeChangeOp.Add,
        "attribute": "groups",
        "value": "2:groups"
    }

    util.accountAdd(account, userGroup)
    expect(account.attributes.groups.length).toBe(2)
    expect(account.attributes.groups[1]).toBe('2:groups')
  })

})


import { AttributeChangeOp } from '@sailpoint/connector-sdk'
import { Util } from '../../src/tools/util'

jest.mock('../../src/http/axios-wrapper')

describe('test happy paths', () => {
  it('accountToUser', async () => {
    const util = new Util
    const userGroup = {
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

    const res = util.accountToUser(userGroup)

    expect(res.email).toStrictEqual("test@test.com")
  })

  it('accountRemove', async () => {
    const util = new Util
    const account = {
      "attributes": {
          "username": "test",
          "groups":[
              "1:group"
          ],
          "email": "test@test.com",
          "title":"title",
          "password": "password"
      },
      "identity": "identity",
      "uuid": ""
  }


    const userGroup = {
      "op": AttributeChangeOp.Remove,
        "attribute": "groups",
        "value": ["1:group"]
    }

    util.accountRemove(account, userGroup)
    expect(account.attributes.groups.length).toBe(0)
  })

  it('accountRemove - no array', async () => {
    const util = new Util
    const account = {
      "attributes": {
          "username": "test",
          "groups":[
              "1:group"
          ],
          "email": "test@test.com",
          "title":"title",
          "password": "password"
      },
      "identity": "identity",
      "uuid": ""
  }


  const userGroup = {
      "op": AttributeChangeOp.Remove,
        "attribute": "groups",
        "value": "1:group"
    }

    util.accountRemove(account, userGroup)
    expect(account.attributes.groups.length).toBe(0)
  })

  
  it('accountAdd', async () => {
    const util = new Util
    const account = {
      "attributes": {
          "username": "test",
          "groups":[
              "1:group"
          ],
          "email": "test@test.com",
          "title":"title",
          "password": "password"
      },
      "identity": "identity",
      "uuid": ""
  }


  const userGroup = {
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
    const account = {
      "attributes": {
          "username": "test",
          "groups":[
              "1:group"
          ],
          "email": "test@test.com",
          "title":"title",
          "password": "password"
      },
      "identity": "identity",
      "uuid": ""
  }


  const userGroup = {
      "op": AttributeChangeOp.Add,
        "attribute": "groups",
        "value": "2:groups"
    }

    util.accountAdd(account, userGroup)
    expect(account.attributes.groups.length).toBe(2)
    expect(account.attributes.groups[1]).toBe('2:groups')
  })

})


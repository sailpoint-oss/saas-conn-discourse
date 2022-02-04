import { AttributeChange, ConnectorError } from "@sailpoint/connector-sdk"

export class Util {
    constructor() {}

    public accountRemove(c: AttributeChange, account: any) {
        if (c.attribute == 'groups') {
            if (Array.isArray(c.value)) {
                c.value.forEach(v => {
                    let i = account.attributes[c.attribute].indexOf(v, 0)
                    if (i > -1) {
                        account.attributes[c.attribute].splice(i, 1)
                    }
                })
            } else {
                let i = account.attributes[c.attribute].indexOf(c.value, 0)
                if (i > -1) {
                    account.attributes[c.attribute].splice(i, 1)
                }
            }
        } else if (account.attributes[c.attribute] != null) {
            account.attributes[c.attribute] = null
        }
    }
    
    public accountAdd(account: any, c: AttributeChange) {
        if (account.attributes[c.attribute] == null) {
            account.attributes[c.attribute] = c.value
        } else {
            if (c.attribute != 'groups') {
                throw new ConnectorError('Cannot add value to attribute: ' + c.attribute)
            }
    
            if (Array.isArray(c.value)) {
                account.attributes[c.attribute] = account.attributes[c.attribute].concat(c.value)
            } else {
                account.attributes[c.attribute].push(c.value)
            }
        }
    }
}
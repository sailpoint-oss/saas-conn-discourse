import { AttributeChange, ConnectorError } from "@sailpoint/connector-sdk"
import { Group } from "./model/group"
import { User } from "./model/user"

export class Util {
    constructor() {}

    public accountToUser(input: any): User {
        if (input.attributes.username == null) {
            throw new ConnectorError(`'username' is required to create user`)
        }
    
        let userGroups: Group[] = []
        if (input.attributes['groups'] != null) {
            if (!Array.isArray(input.attributes['groups'])) {
                input.attributes['groups'] = [input.attributes['groups']]
            }
    
            for (const group of input.attributes['groups']) {
                if (typeof group !== 'string') {
                    throw new ConnectorError('Invalid role type: ' + group)
                }
    
                let groupParts = group.split(':')
                if (groupParts.length != 2) {
                    throw new ConnectorError('Invalid role format: ' + group)
                }
    
                let userGroup = new Group()
                userGroup.id = Number(groupParts[0])
                if (isNaN(userGroup.id)) {
                    throw new ConnectorError('Invalid role format: ' + group)
                }
                userGroup.name = groupParts[1]
                userGroups.push(userGroup)
            }
        }
    
        let user = new User()
        user.email = input.attributes.email
        // If account create command, identity isn't provided since Discourse creates the ID.
        user.id = input.identity == null ? -1 : input.identity
        user.username = input.attributes.username
        user.title = input.attributes.title
        user.password = input.attributes.password
        user.groups = userGroups
    
        return user
    }
    
    public userToAccount(user: User): any {
        return {
            // Convert id to string because IDN doesn't work well with number types for the account ID
            identity: user.id?.toString(),
            uuid: user.username,
            attributes: {
                username: user.username,
                id: user.id?.toString(),
                email: user.email,
                title: user.title,
                groups: user.groups!.map(group => { return `${group.id}:${group.name}` })
            }
        }
    }
    
    public groupToEntitlement(group: Group): any {
        return {
            identity: group.id + ':' + group.name,
            uuid: group.id + ':' + group.name,
            attributes: {
                id: group.id + ':' + group.name,
                name: group.name
            }
        }
    }


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
    public accountSet(account: any, c: AttributeChange) {
        account.attributes[c.attribute] = c.value
    }
}
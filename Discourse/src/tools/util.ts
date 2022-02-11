import { AttributeChange, ConnectorError, StdAccountCreateInput, StdAccountCreateOutput, StdEntitlementListOutput } from "@sailpoint/connector-sdk"
import { Group } from "../model/group"
import { User } from "../model/user"

export class Util {

    public accountToUser(input: StdAccountCreateInput): User {
        if (input.attributes.username == null) {
            throw new ConnectorError(`'username' is required to create user`)
        }
    
        const userGroups: Group[] = []
        if (input.attributes['groups'] != null) {
            if (!Array.isArray(input.attributes['groups'])) {
                input.attributes['groups'] = [input.attributes['groups']]
            }
    
            for (const group of input.attributes['groups']) {
                if (typeof group !== 'string') {
                    throw new ConnectorError('Invalid role type: ' + group)
                }
    
                const groupParts = group.split(':')
                if (groupParts.length != 2) {
                    throw new ConnectorError('Invalid role format: ' + group)
                }
    
                const userGroup = new Group()
                userGroup.id = Number(groupParts[0])
                if (isNaN(userGroup.id)) {
                    throw new ConnectorError('Invalid role format: ' + group)
                }
                userGroup.name = groupParts[1]
                userGroups.push(userGroup)
            }
        }
    
        const user = new User()
        user.email = input.attributes.email
        // If account create command, identity isn't provided since Discourse creates the ID.
        user.id = input.identity == null ? -1 : Number(input.identity)
        user.username = input.attributes.username
        user.title = input.attributes.title
        user.password = input.attributes.password
        user.groups = userGroups
    
        return user
    }
    
    public userToAccount(user: User): StdAccountCreateOutput {
        return {
            // Convert id to string because IDN doesn't work well with number types for the account ID
            identity: user.id ? user.id.toString() : '',
            uuid: user.username ? user.username : '',
            attributes: {
                username: user.username ? user.username : '',
                id: user.id ? user.id.toString() : '',
                email: user.email ? user.email : '',
                title: user.title ? user.title : '',
                groups: user.groups ? user.groups.map(group => { return `${group.id}:${group.name}` }) : null
            }
        }
    }
    
    public groupToEntitlement(group: Group): StdEntitlementListOutput {
        return {
            identity: group.id + ':' + group.name,
            uuid: group.id + ':' + group.name,
            attributes: {
                id: group.id + ':' + group.name,
                name: group.name ? group.name : ''
            }
        }
    }


    public accountRemove(account: StdAccountCreateOutput, c: AttributeChange) {
        if (c.attribute == 'groups') {
            if (Array.isArray(c.value)) {
                c.value.forEach(v => {
                    const attribute: string[] = <string[]>account.attributes[c.attribute]
                    const position = attribute.indexOf(v, 0)
                    if (position > -1) {
                        attribute.splice(position, 1)
                    }
                })
            } else {
                const attribute: string[] = <string[]>account.attributes[c.attribute]
                const position = attribute.indexOf(c.value, 0)
                if (position > -1) {
                    attribute.splice(position, 1)
                }
            }
        } else if (account.attributes[c.attribute] != null) {
            account.attributes[c.attribute] = null
        }
    }
    
    public accountAdd(account: StdAccountCreateOutput, c: AttributeChange) {
        const attribute: string[] = <string[]>account.attributes[c.attribute]
        if (attribute == null) {
            account.attributes[c.attribute] = c.value
        } else {
            if (c.attribute != 'groups') {
                throw new ConnectorError('Cannot add value to attribute: ' + c.attribute)
            }
    
            if (Array.isArray(c.value)) {
                account.attributes[c.attribute] = attribute.concat(c.value)
            } else {
                attribute.push(c.value)
            }
        }
    }
    public accountSet(account: StdAccountCreateOutput, c: AttributeChange) {
        account.attributes[c.attribute] = c.value
    }
}
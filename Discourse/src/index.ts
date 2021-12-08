import {
    Context,
    ConnectorError,
    createConnector,
    readConfig,
    Response,
    StdAccountCreateInput,
    StdAccountCreateOutput,
    StdAccountListOutput,
    StdAccountReadInput,
    StdAccountReadOutput,
    StdAccountUpdateInput,
    StdAccountUpdateOutput,
    StdEntitlementListOutput,
    StdEntitlementReadOutput,
    StdEntitlementReadInput,
    StdTestConnectionOutput,
    AttributeChangeOp
} from '@sailpoint/connector-sdk'
import { DiscourseClient } from './discourse-client'
import { Group } from './model/group'
import { User } from './model/user'
import { UserUpdate } from './model/user-update'

// Connector must be exported as module property named connector
export const connector = async () => {

    // Get connector source config
    const config = await readConfig()

    // Use the vendor SDK, or implement own client as necessary, to initialize a client
    const discourseClient = new DiscourseClient(config)

    return createConnector()
        .stdTestConnection(async (context: Context, input: undefined, res: Response<StdTestConnectionOutput>) => {
            res.send(await discourseClient.testConnection())
        })
        .stdAccountCreate(async (context: Context, input: StdAccountCreateInput, res: Response<StdAccountCreateOutput>) => {
            console.log(`Input received for account create: ${JSON.stringify(input)}`)
            const user = await discourseClient.createUser(accountToUser(input))
            res.send(userToAccount(user))
        })
        .stdAccountList(async (context: Context, input: undefined, res: Response<StdAccountListOutput>) => {
            const users = await discourseClient.getUsers()

            for (const user of users) {
                res.send(userToAccount(user))
            }
        })
        .stdAccountRead(async (context: Context, input: StdAccountReadInput, res: Response<StdAccountReadOutput>) => {
            const user = await discourseClient.getUser(input.identity)

            res.send(userToAccount(user))
        })
        .stdAccountUpdate(async (context: Context, input: StdAccountUpdateInput, res: Response<StdAccountUpdateOutput>) => {
            const origUser = await discourseClient.getUser(input.identity)
            let account = userToAccount(origUser)
    
            input.changes.forEach(c => {
                switch (c.op) {
                    case AttributeChangeOp.Add:
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
                        break
                    case AttributeChangeOp.Set:
                        account.attributes[c.attribute] = c.value
                        break
                    case AttributeChangeOp.Remove:
                        if (c.attribute == 'groups') {
                            if (Array.isArray(c.value)) {
                                c.value.forEach(v => {
                                    let i =  account.attributes[c.attribute].indexOf(v, 0)
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
                        break
                    default:
                        throw new ConnectorError('Unknown account change op: ' + c.op)
                }
            })
    
            let preUpdateUser = accountToUser(account)
            let updatedUser = await discourseClient.updateUser(account.uuid, origUser, preUpdateUser)
    
            if (User.equals(preUpdateUser, updatedUser)) {
                res.send({})
            } else {
                res.send(userToAccount(updatedUser))
            }
        })
        .stdEntitlementList(async (context: Context, input: undefined, res: Response<StdEntitlementListOutput>) => {
            const groups = await discourseClient.getGroups()

            for (const group of groups) {
                res.send(groupToEntitlement(group))
            }
        })
        .stdEntitlementRead(async (context: Context, input: StdEntitlementReadInput, res: Response<StdEntitlementReadOutput>) => {
            const group = await discourseClient.getGroup(input.identity)

            res.send(groupToEntitlement(group))
        })
}

const accountToUser = (input: any): User => {
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

const userToAccount = (user: User): any => {
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

const groupToEntitlement = (group: Group): any => {
    return {
        identity: group.id + ':' + group.name,
		uuid: group.id + ':' + group.name,
		attributes: {
			id: group.id + ':' + group.name,
			name: group.name
		}
    }
}

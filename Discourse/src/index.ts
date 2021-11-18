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
    StdEntitlementListOutput,
    StdEntitlementReadOutput,
    StdEntitlementReadInput,
    StdTestConnectionOutput,
} from '@sailpoint/connector-sdk'
import { DiscourseClient } from './discourse-client'
import { Group } from './model/group'
import { User } from './model/user'

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
        .stdEntitlementList(async (context: Context, input: undefined, res: Response<StdEntitlementListOutput>) => {
            const groups = await discourseClient.getGroups()

            for (const group of groups) {
                res.send({
                    identity: group.name!,
                    uuid: group.id!.toString(),
                    attributes: {
                        name: group.name!,
                        id: group.id!,
                    },
                })
            }
        })
        .stdEntitlementRead(async (context: Context, input: StdEntitlementReadInput, res: Response<StdEntitlementReadOutput>) => {
            const group = await discourseClient.getGroup(input.identity)

            res.send({
                identity: group.name!,
                uuid: group.id!.toString(),
                attributes: {
                    name: group.name!,
                    id: group.id!,
                },
            })
        })
}

const accountToUser = (input: any): User => {
	if (input.identity == null) {
		throw new ConnectorError(`'identity' is required to create user`)
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
    user.email = input.identity
    user.username = input.attributes['username']
    user.title = input.attributes['title']
    user.groups = userGroups

	return user
}

const userToAccount = (user: User): any => {
    return {
        identity: user.email,
        uuid: user.username,
        attributes: {
            username: user.username,
            id: user.id,
            email: user.email,
            title: user.title,
            groups: user.groups!.map(group => { return `${group.id}:${group.name}` })
        }
    }
}
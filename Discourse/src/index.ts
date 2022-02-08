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
    StdAccountDeleteInput,
    StdAccountDeleteOutput,
    StdEntitlementListOutput,
    StdEntitlementReadOutput,
    StdEntitlementReadInput,
    StdTestConnectionOutput,
    AttributeChangeOp
} from '@sailpoint/connector-sdk'
import { DiscourseClient } from './discourse-client'
import { Group } from './model/group'
import { User } from './model/user'
import { Util } from './util'

// Connector must be exported as module property named connector
export const connector = async () => {

    // Get connector source config
    const config = await readConfig()
    
    const util = new Util();

    // Use the vendor SDK, or implement own client as necessary, to initialize a client
    const discourseClient = new DiscourseClient(config)

    return createConnector()
        .stdTestConnection(async (context: Context, input: undefined, res: Response<StdTestConnectionOutput>) => {
            res.send(await discourseClient.testConnection())
        })
        .stdAccountCreate(async (context: Context, input: StdAccountCreateInput, res: Response<StdAccountCreateOutput>) => {
            const user = await discourseClient.createUser(util.accountToUser(input))
            res.send(util.userToAccount(user))
        })
        .stdAccountList(async (context: Context, input: undefined, res: Response<StdAccountListOutput>) => {
            const users = await discourseClient.getUsers()

            for (const user of users) {
                res.send(util.userToAccount(user))
            }
        })
        .stdAccountRead(async (context: Context, input: StdAccountReadInput, res: Response<StdAccountReadOutput>) => {
            const user = await discourseClient.getUser(input.identity)

            res.send(util.userToAccount(user))
        })
        .command("std:account:disable", async (context: Context, input: any, res: Response<any>) => {
            const user = await discourseClient.getUser(input.identity)

            res.send(util.userToAccount(user))
        })
        .stdAccountUpdate(async (context: Context, input: StdAccountUpdateInput, res: Response<StdAccountUpdateOutput>) => {
            const origUser = await discourseClient.getUser(input.identity)
            let account = util.userToAccount(origUser)
    
            input.changes.forEach(c => {
                switch (c.op) {
                    case AttributeChangeOp.Add:
                        util.accountAdd(account, c)
                        break
                    case AttributeChangeOp.Set:
                        util.accountSet(account, c)
                        break
                    case AttributeChangeOp.Remove:
                        util.accountRemove(c, account)
                        break
                    default:
                        throw new ConnectorError('Unknown account change op: ' + c.op)
                }
            })
    
            let preUpdateUser = util.accountToUser(account)
            let updatedUser = await discourseClient.updateUser(account.uuid, origUser, preUpdateUser)
    
            if (User.equals(origUser, updatedUser)) {
                res.send({})
            } else {
                res.send(util.userToAccount(updatedUser))
            }
        })
        .stdAccountDelete(async (context: Context, input: StdAccountDeleteInput, res: Response<StdAccountDeleteOutput>) => {
            res.send(await discourseClient.deleteUser(input.identity))
        })
        .stdEntitlementList(async (context: Context, input: undefined, res: Response<StdEntitlementListOutput>) => {
            const groups = await discourseClient.getGroups()

            for (const group of groups) {
                res.send(util.groupToEntitlement(group))
            }
        })
        .stdEntitlementRead(async (context: Context, input: StdEntitlementReadInput, res: Response<StdEntitlementReadOutput>) => {
            const group = await discourseClient.getGroup(input.identity)

            res.send(util.groupToEntitlement(group))
        })
}




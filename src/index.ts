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
import { User } from './model/user'
import { Util } from './tools/util'
import { logger } from './tools/logger';

// Connector must be exported as module property named connector
export const connector = async () => {

    // Get connector source config
    const config = await readConfig()
    
    const util = new Util();

    // Use the vendor SDK, or implement own client as necessary, to initialize a client
    const discourseClient = new DiscourseClient(config)

    return createConnector()
        .stdTestConnection(async (context: Context, input: undefined, res: Response<StdTestConnectionOutput>) => {
            console.log('testing connector logging')
            logger.info('testing connector logging using logger')
            res.send(await discourseClient.testConnection())
        })
        .stdAccountCreate(async (context: Context, input: StdAccountCreateInput, res: Response<StdAccountCreateOutput>) => {
            logger.info(input, 'creating user')
            const user = await discourseClient.createUser(util.accountToUser(input))
            res.send(util.userToAccount(user))
        })
        .stdAccountList(async (context: Context, input: undefined, res: Response<StdAccountListOutput>) => {
            const users = await discourseClient.getUsers()
            //logger.info(users, 'found users, return result')
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
            const account = util.userToAccount(origUser)
    
            input.changes.forEach(c => {
                switch (c.op) {
                    case AttributeChangeOp.Add:
                        util.accountAdd(account, c)
                        break
                    case AttributeChangeOp.Set:
                        util.accountSet(account, c)
                        break
                    case AttributeChangeOp.Remove:
                        util.accountRemove(account, c)
                        break
                    default:
                        throw new ConnectorError('Unknown account change op: ' + c.op)
                }
            })
    
            const preUpdateUser = util.accountToUser(account)
            const updatedUser = await discourseClient.updateUser(origUser, preUpdateUser, account.uuid)
    
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




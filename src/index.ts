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
            logger.debug('testing connector')
            res.send(await discourseClient.testConnection())
        })
        .stdAccountCreate(async (context: Context, input: StdAccountCreateInput, res: Response<StdAccountCreateOutput>) => {
            logger.debug(input, 'account create input object')
            const user = await discourseClient.createUser(util.accountToUser(input))
            logger.debug(user, 'new discourse user object')
            res.send(util.userToAccount(user))
        })
        .stdAccountList(async (context: Context, input: undefined, res: Response<StdAccountListOutput>) => {
            logger.debug('listing accounts')
            const users = await discourseClient.getUsers()
            logger.debug(users, 'discourse users found')
            for (const user of users) {
                res.send(util.userToAccount(user))
            }
        })
        .stdAccountRead(async (context: Context, input: StdAccountReadInput, res: Response<StdAccountReadOutput>) => {
            logger.debug(input, 'account read input object')
            const user = await discourseClient.getUser(input.identity)
            logger.debug(user, 'discourse user found')
            res.send(util.userToAccount(user))
        })
        .command("std:account:disable", async (context: Context, input: any, res: Response<any>) => {
            logger.debug(input, 'account disable input object')
            const user = await discourseClient.getUser(input.identity)
            logger.debug(user, 'discourse user found')
            res.send(util.userToAccount(user))
        })
        .stdAccountUpdate(async (context: Context, input: StdAccountUpdateInput, res: Response<StdAccountUpdateOutput>) => {
            logger.debug(input, 'account update input object')
            const origUser = await discourseClient.getUser(input.identity)
            logger.debug(origUser, 'discourse user found')
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
            logger.debug(updatedUser, 'updated user')
            if (User.equals(origUser, updatedUser)) {
                res.send({})
            } else {
                res.send(util.userToAccount(updatedUser))
            }
        })
        .stdAccountDelete(async (context: Context, input: StdAccountDeleteInput, res: Response<StdAccountDeleteOutput>) => {
            logger.debug(input, 'account delete input object')
            res.send(await discourseClient.deleteUser(input.identity))
        })
        .stdEntitlementList(async (context: Context, input: undefined, res: Response<StdEntitlementListOutput>) => {
            logger.debug('listing entitlements')
            const groups = await discourseClient.getGroups()
            logger.debug(groups, 'discourse groups found')
            for (const group of groups) {
                res.send(util.groupToEntitlement(group))
            }
        })
        .stdEntitlementRead(async (context: Context, input: StdEntitlementReadInput, res: Response<StdEntitlementReadOutput>) => {
            logger.debug(input, 'entitlement read input object')
            const group = await discourseClient.getGroup(input.identity)
            logger.debug(group, 'discourse group found')
            res.send(util.groupToEntitlement(group))
        })
}




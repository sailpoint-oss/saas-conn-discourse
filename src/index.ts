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
    AttributeChangeOp,
    StdEntitlementListInput,
    StdAccountListInput,
    StdAccountEnableInput,
    StdAccountEnableOutput,
    StdAccountDisableInput,
    StdAccountDisableOutput,
    StdAccountUnlockInput,
    StdAccountUnlockOutput
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
        .stdAccountList(async (context: Context, input: StdAccountListInput, res: Response<StdAccountListOutput>) => {
            logger.debug('listing accounts')
            let resultsCount = 5
            let offset = 0
            while (resultsCount == 5) {
                const users = await discourseClient.getUsers(offset, 5)
                resultsCount = users.length
                logger.debug(users, 'discourse users found')
                for (const user of users) {
                    res.send(util.userToAccount(user))
                }
                offset += 5
            }
            

        })
        .stdAccountRead(async (context: Context, input: StdAccountReadInput, res: Response<StdAccountReadOutput>) => {
            logger.debug(input, 'account read input object')
            const user = await discourseClient.getUser(input.identity)
            logger.debug(user, 'discourse user found')
            res.send(util.userToAccount(user))
        })
        .stdAccountEnable(async (context: Context, input: StdAccountEnableInput, res: Response<StdAccountEnableOutput>) => {
            logger.debug(input, 'account enable input object')
            const suspended = await discourseClient.unsuspendUser(input.identity)
            const user = await discourseClient.getUser(input.identity)
            if (suspended && user) {
                res.send(util.userToAccount(user))
            } else {
                throw new ConnectorError('Failed to unsuspend user')
            }
        })
        .stdAccountUnlock(async (context: Context, input: StdAccountUnlockInput, res: Response<StdAccountUnlockOutput>) => {
            logger.debug(input, 'account unlock input object')
            const user = await discourseClient.getUser(input.identity)
            const resetPassword = await discourseClient.forgotPassword(user.username)
            if (resetPassword && user) {
                res.send(util.userToAccount(user))
            } else {
                throw new ConnectorError('Failed to send user password change email')
            }
        })
        .stdAccountDisable(async (context: Context, input: StdAccountDisableInput, res: Response<StdAccountDisableOutput>) => {
            logger.debug(input, 'account disable input object')
            const user = await discourseClient.getUser(input.identity)
            if (user.admin) {
                await discourseClient.revokeAdmin(input.identity)
            }
            const suspended = await discourseClient.suspendUser(input.identity)
            
            if (suspended && user) {
                res.send(util.userToAccount(user))
            } else {
                throw new ConnectorError('Failed to suspend user')
            }
            
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
            if ('uuid' in account) {
                const updatedUser = await discourseClient.updateUser(origUser, preUpdateUser, account.uuid)
                logger.debug(updatedUser, 'updated user')
                if (User.equals(origUser, updatedUser)) {
                    res.send({})
                } else {
                    res.send(util.userToAccount(updatedUser))
                }
            } else {
                throw new ConnectorError('unexpected type returned in user object')
            }
        })
        .stdAccountDelete(async (context: Context, input: StdAccountDeleteInput, res: Response<StdAccountDeleteOutput>) => {
            logger.debug(input, 'account delete input object')
            const user = await discourseClient.getUser(input.identity)
            if (user.admin) {
                await discourseClient.revokeAdmin(input.identity)
            }
            res.send(await discourseClient.deleteUser(input.identity))
        })
        .stdEntitlementList(async (context: Context, input: StdEntitlementListInput, res: Response<StdEntitlementListOutput>) => {
            logger.debug('listing entitlements')
            let page = 0
            let hasMorePages = true
            while (hasMorePages) {
                const groups = await discourseClient.getGroups(page)
                if (groups.length === 0) {
                    hasMorePages = false
                } else {
                    logger.debug(groups, 'discourse groups found')
                    for (const group of groups) {
                        res.send(util.groupToEntitlement(group))
                    }
                }
                page++
            }

        })
        .stdEntitlementRead(async (context: Context, input: StdEntitlementReadInput, res: Response<StdEntitlementReadOutput>) => {
            logger.debug(input, 'entitlement read input object')
            const group = await discourseClient.getGroup(input.identity)
            logger.debug(group, 'discourse group found')
            res.send(util.groupToEntitlement(group))
        })
}

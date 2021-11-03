import {
    Context,
    createConnector,
    readConfig,
    Response,
    StdAccountListOutput,
    StdAccountReadInput,
    StdAccountReadOutput,
    StdTestConnectionOutput,
} from '@sailpoint/connector-sdk'
import { DiscourseClient } from './discourse-client'
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
        .stdAccountList(async (context: Context, input: undefined, res: Response<StdAccountListOutput>) => {
            const users = await discourseClient.getUsers()

            for (const user of users) {
                res.send({
                    identity: user.username!,
                    uuid: user.id!.toString(),
                    attributes: {
                        username: user.username!,
                        id: user.id!,
                        email: user.email!,
                        title: user.title!
                    },
                })
            }
        })
        .stdAccountRead(async (context: Context, input: StdAccountReadInput, res: Response<StdAccountReadOutput>) => {
            const account = await discourseClient.getAccount(input.identity)

            res.send({
                identity: account.username,
                uuid: account.id,
                attributes: {
                    firstName: account.firstName,
                    lastName: account.lastName,
                    email: account.email,
                },
            })
        })
}

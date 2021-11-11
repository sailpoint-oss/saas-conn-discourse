import {
    Context,
    createConnector,
    readConfig,
    Response,
    StdAccountListOutput,
    StdAccountReadInput,
    StdAccountReadOutput,
    StdEntitlementListOutput,
    StdEntitlementReadOutput,
    StdEntitlementReadInput,
    StdTestConnectionOutput,
} from '@sailpoint/connector-sdk'
import { DiscourseClient } from './discourse-client'

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
                    identity: user.id!.toString(),
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
            const user = await discourseClient.getUser(input.identity)

            res.send({
                identity: user.id!.toString(),
                uuid: user.id!.toString(),
                attributes: {
                    username: user.username!,
                    id: user.id!,
                    email: user.email!,
                    title: user.title!
                },
            })
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
                        display_name: group.display_name!
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
                    display_name: group.display_name!
                },
            })
        })
}

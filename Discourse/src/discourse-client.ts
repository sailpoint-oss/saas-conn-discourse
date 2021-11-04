import { ConnectorError } from "@sailpoint/connector-sdk"
import axios, { AxiosInstance } from "axios"
import { User } from "./model/user"

export class DiscourseClient {
    private readonly apiKey?: string
    private readonly apiUsername?: string
    private readonly baseUrl?: string
    httpClient: AxiosInstance

    constructor(config: any) {
        // Fetch necessary properties from config.
        this.apiKey = config?.apiKey
        if (this.apiKey == null) {
            throw new ConnectorError('apiKey must be provided from config')
        }

        this.apiUsername = config?.apiUsername
        if (this.apiUsername == null) {
            throw new ConnectorError('apiUsername must be provided from config')
        }

        this.baseUrl = config?.baseUrl
        if (this.baseUrl == null) {
            throw new ConnectorError('baseUrl must be provided from config')
        }

        this.httpClient = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Api-Key': this.apiKey,
                'Api-Username': this.apiUsername
            }
        })
    }

    async getUsers(): Promise<User[]> {
        let page:number = 1
        let hasMorePages:boolean = true
        let users:User[] = []
        
        while (hasMorePages) {
            let response = await this.httpClient.get<User[]>('/admin/users/list/staff.json', {
                params: {
                    page: page
                }
            })

            if (response.data == null) {
                throw new ConnectorError('Failed to retrieve list of users')
            } else {
                users = users.concat(response.data);
                response.data.length > 0 ? page += 1 : hasMorePages = false
            }
        }
        
        return users
    }

    async getUser(identity: string): Promise<any> {
        let response = await this.httpClient.get<User>(`/admin/users/${identity}.json`)

        if (response.data == null) {
            throw new ConnectorError('Failed to retrieve user ${identity}')
        } else {
            return response.data
        }
    }

    async testConnection(): Promise<any> {
        await this.httpClient.get<User[]>('/admin/users/list/staff.json')
        return {}
    }
}

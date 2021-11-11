import { ConnectorError } from "@sailpoint/connector-sdk"
import axios, { AxiosInstance } from "axios"
import { User } from "./model/user"
import { Group } from "./model/group"
import { GroupListResponse } from "./model/group-list-response"
import { GroupResponse } from "./model/group-response"

/**
 * DiscourseClient is the client that communicates with Discourse APIs.
 */
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

    /**
	 * Test connection by listing users from the Discourse instance.  
     * This will make sure the apiKey has the correct access.
	 * @returns empty struct if response is 2XX
	 */
    async testConnection(): Promise<any> {
        await this.httpClient.get<User[]>('/admin/users/list/staff.json')
        return {}
    }

    /**
	 * List all users with pagination.
	 * @returns a list of users.
	 */
    async getUsers(): Promise<User[]> {
        let page:number = 1
        let hasMorePages:boolean = true
        let users:User[] = []
        
        while (hasMorePages) {
            let response = await this.httpClient.get<User[]>('/admin/users/list/staff.json', {
                params: {
                    page: page,
                    show_emails: true
                }
            })

            if (response.status !== 200) {
                throw new ConnectorError('Failed to retrieve list of users')
            } else {
                users = users.concat(response.data);
                response.data.length > 0 ? page += 1 : hasMorePages = false
            }
        }
        
        return users
    }

    /**
	 * Retrieve a single user by identity.
	 * @param identity the numeric ID of the user represented as a string.
	 * @returns the agent.
	 */
    async getUser(identity: string): Promise<any> {
        let response = await this.httpClient.get<User>(`/admin/users/${identity}.json`)

        if (response.status !== 200) {
            throw new ConnectorError('Failed to retrieve user ${identity}')
        } else {
            return response.data
        }
    }

    /**
	 * List groups with pagination
	 * @returns a list of groups.
	 */
	async getGroups(): Promise<Group[]> {
		let page:number = 0
        let hasMorePages:boolean = true
        let groups:Group[] = []
        
        while (hasMorePages) {
            let response = await this.httpClient.get<GroupListResponse>('/groups.json', {
                params: {
                    page: page
                }
            })

            if (response.status !== 200) {
                throw new ConnectorError('Failed to retrieve list of groups')
            } else {
                groups = groups.concat(response.data.groups!);
                response.data.groups!.length > 0 ? page += 1 : hasMorePages = false
            }
        }
        
        return groups
	}

    /**
	 * Get a single group by ID.  The ID is the name of the group not the numeric ID.
     * @param name the name of the group
	 * @returns a single group.
	 */
	async getGroup(name: string): Promise<Group> {
		let response = await this.httpClient.get<GroupResponse>(`/groups/${name}.json`)

		if (response.status !== 200){
			throw new ConnectorError(`Failed to retrieve the ${name} group.`)
		} else {
			return response.data.group!
		}
	}
}

import { ConnectorError } from "@sailpoint/connector-sdk"
import axios, { AxiosInstance } from "axios"
import { User } from "./model/user"
import { Group } from "./model/group"
import { GroupListResponse } from "./model/group-list-response"
import { GroupResponse } from "./model/group-response"
import { GroupMembers } from "./model/group-members"
import { UserEmail } from "./model/user-email"

/**
 * DiscourseClient is the client that communicates with Discourse APIs.
 */
export class DiscourseClient {
    private readonly apiKey?: string
    private readonly apiUsername?: string
    private readonly baseUrl?: string
    private readonly primaryGroup?: string
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

        this.primaryGroup = config?.primaryGroup
        if (this.primaryGroup == null) {
            throw new ConnectorError('primaryGroup must be provided from config')
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
    // async getUsers(): Promise<User[]> {
    //     let page:number = 1
    //     let hasMorePages:boolean = true
    //     let users:User[] = []
        
    //     while (hasMorePages) {
    //         let response = await this.httpClient.get<User[]>('/admin/users/list/staff.json', {
    //             params: {
    //                 page: page,
    //                 show_emails: true
    //             }
    //         })

    //         if (response.status !== 200) {
    //             throw new ConnectorError('Failed to retrieve list of users')
    //         } else {
    //             users = users.concat(response.data);
    //             response.data.length > 0 ? page += 1 : hasMorePages = false
    //         }
    //     }
        
    //     return users
    // }

    async getUsers(): Promise<User[]> {
        // First, get the members of the group.  This will return a subset of the fields we need to complete a user.
        const groupMembers = await this.getGroupMembers(this.primaryGroup!)

        // Get the full user representation
        let users = await Promise.all(groupMembers.map(member => this.getUser(member.id!.toString())))

        // Emails aren't included in the above call.  Need to get each user's email address from a different endpoint.
        const emails = await Promise.all(groupMembers.map(member => this.getUserEmailAddress(member.username!)))
        
        // Add each email address to the full user representation
        for (let i = 0; i < groupMembers.length; i++) {
            users[i].email = emails[i]
        }

        return users
    }

    private async getGroupMembers(groupname: string): Promise<User[]> {
        let offset = 0
        let total = 1 // Set total to 1 until we get the actual total from the first call
        let limit = 5
        let members:User[] = []

        while (offset < total) {
            let response = await this.httpClient.get<GroupMembers>(`/groups/${groupname}/members.json`, {
                params: {
                    offset: offset,
                    limit: limit
                }
            })

            if (response.status !== 200) {
                throw new ConnectorError(`Failed to retrieve members for group ${groupname}`)
            } else {
                members = members.concat(response.data.members!);
                total = response.data.meta!.total
                offset += limit
            }
        }

        return members
    }

    private async getUserEmailAddress(username: string): Promise<string> {
        let response = await this.httpClient.get<UserEmail>(`/u/${username}/emails.json`)

        if (response.status !== 200) {
            throw new ConnectorError(`Failed to retrieve email for user ${username}`)
        } else {
            return response.data.email!
        }
    }

    /**
	 * Retrieve a single user by identity.
	 * @param identity the numeric ID of the user represented as a string.
	 * @returns the agent.
	 */
    async getUser(identity: string): Promise<User> {
        const userResponse = await this.httpClient.get<User>(`/admin/users/${identity}.json`)

        let user = null

        if (userResponse.status !== 200) {
            throw new ConnectorError(`Failed to retrieve user ${identity}`)
        } else {
            user = userResponse.data
            user.email = await this.getUserEmailAddress(user.username!)
            return user
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

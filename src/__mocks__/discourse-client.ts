
import { User } from "../model/user"
import { Group } from "../model/group"
import { Config } from "../model/config"
import user from "../http/__mocks__/user.json"
import groupListResponse from "../http/__mocks__/group-list-response.json"
import crypto from "crypto"


/**
 * DiscourseClient is the client that communicates with Discourse APIs.
 */
export class DiscourseClient {
    private readonly apiKey?: string
    private readonly apiUsername?: string
    private readonly baseUrl?: string
    private readonly primaryGroup?: string


    constructor(config: Config) {}

    /**
     * Test connection by listing users from the Discourse instance.  
     * This will make sure the apiKey has the correct access.
     * @returns empty struct if response is 2XX
     */
    async testConnection(): Promise<any> {
        return {}
    }

    /**
     * Create a user.
     * @param user the user to be created.
     * @returns the user.
     */
    async createUser(user: User): Promise<User> {
        return await this.updateUser(user.username!, {"id": -1}, {"id": -1})
    }

    private generateRandomPassword(): string {
        return crypto.randomBytes(20).toString('hex');
    }

    /**
     * Delete a user by identity.
     * @param identity the id of the user.
     * @returns empty struct if response is 2XX
     */
    async deleteUser(identity: string): Promise<any> {
        return {}
    }

    async getUsers(): Promise<User[]> {
        let users: any = []
        users.push(user["/admin/users/100.json"])
        return users
    }

    private async getGroupMembers(groupname: string): Promise<User[]> {
        let users: any = []
        users.push(user["/admin/users/100.json"])
        users.push(user["/admin/users/1305.json"])
        return users
    }

    private async getUserEmailAddress(username: string): Promise<string> {
        return "test@test.com"
    }

    private async addUserToGroup(groupId: number, username: string): Promise<boolean> {
        return true
    }

    private async removeUserFromGroup(groupId: number, userId: string): Promise<boolean> {
        return true
    }


    /**
     * update a user by username.
     * @param username the username of the user.
     * @param origUser the original user before the update.
     * @param newUser the user data to be updated.
     * @returns the updated user.
     */
    async updateUser(username: string, origUser: User, newUser: User): Promise<User> {
        return await this.getUser("")
    }

    /**
     * Retrieve a single user by identity.
     * @param identity the numeric ID of the user represented as a string.
     * @returns the user.
     */
    async getUser(identity: string): Promise<User> {
        let users: any
        users = user["/admin/users/1305.json"]
        return users
    }

    /**
    * Retrieve a single user by username.
    * @param username the username of the user
    * @returns the user.
    */
    async getUserByUsername(username: string): Promise<User> {
        let users: any
        users = user["/admin/users/1305.json"]
        return users
    }


    /**
     * List groups with pagination
     * @returns a list of groups.
     */
    async getGroups(page: number): Promise<Group[]> {
        let groups: any = groupListResponse.groups[0]
        groups
        if (page > 0) {
            return []
        }
        return [groups]
    }

    /**
     * Get a single group by ID.  The ID is the name of the group not the numeric ID.
     * @param name the name of the group
     * @returns a single group.
     */
    async getGroup(name: string): Promise<Group> {
        let group: any = groupListResponse.groups[0]
        return group
    }
}

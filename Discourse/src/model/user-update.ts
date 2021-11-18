import { User } from "./user"

/**
 * The user fields that can be updated
 */
export class UserUpdate {
    username?: string
    active?: boolean
    admin?: boolean
    moderator?: boolean
    trust_level?: number
    title?: string

    /**
     * Create UserUpdate from User.
     * @param user the user.
     * @returns converted UserUpdate object.
     */
	static fromUser(user: User): UserUpdate {
		let update = new UserUpdate()

		update.username = user.username
		update.active = user.active
		update.admin = user.admin
		update.moderator = user.moderator
		update.trust_level = user.trust_level
		update.title = user.title
		
		return update
	}
}
import { Group } from "./group"
import { User } from "./user"

/**
 * The user fields that can be updated
 */
export class UserUpdate {
    id = -1
    username?: string
    active?: boolean
    admin?: boolean
    moderator?: boolean
    trust_level?: number
    title?: string
    groups?: Group[]
    name?: string
    user_fields?: any

    /**
     * Create UserUpdate from User.
     * @param user the user.
     * @returns converted UserUpdate object.
     */
	static fromUser(user: User): UserUpdate {
		const update = new UserUpdate()

		update.username = user.username
		update.active = user.active
		update.admin = user.admin
		update.moderator = user.moderator
		update.trust_level = user.trust_level
		update.title = user.title
        update.groups = user.groups
        update.name = user.name
        update.user_fields = user.user_fields
        
		
		return update
	}
}
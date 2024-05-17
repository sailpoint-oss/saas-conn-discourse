import { Group } from "./group"

/**
 * User is a complete definition of a user, including entitlements
 */
export class User {
    id = -1
    username?: string
    email?: string
    active?: boolean
    admin?: boolean
    moderator?: boolean
    trust_level?: number
    title?: string
    password?: string
    groups?: Group[]
	user_fields?: {[key: string]: string};
	name?: string

    /**
	 * Static method to compare two users
	 * @param a first user
	 * @param b second user
	 * @returns true if the two users are the same
	 */
	static equals(a: User, b: User): boolean {
		if (a == null || b == null || a.id != b.id || a.username != b.username || a.email != b.email
			|| a.active != b.active || a.admin != b.admin || a.moderator != b.moderator || a.trust_level != b.trust_level
			|| a.title != b.title || a.name != b.name) {

			return false
		}

		for (const key in a.user_fields) {
			if (b.user_fields !== undefined && a.user_fields[key] != b.user_fields[key]) {
				return false
			}
		}

		for (const key in b.user_fields) {
			if (a.user_fields !== undefined && b.user_fields[key] != a.user_fields[key]) {
				return false
			}
		}

		if (a.groups == null || b.groups == null || a.groups.length != b.groups.length) {
			return false
		}


        // Sort the two groups by id first.  If id's match, then sort by group name.
		a.groups.sort((x, y) => x.id == y.id ? x.name.localeCompare(y.name) : x.id - y.id)
		b.groups.sort((x, y) => x.id == y.id ? x.name.localeCompare(y.name) : x.id - y.id)

		for (let i = 0; i < a.groups.length; i ++) {
			if (a.groups[i].id != b.groups[i].id || a.groups[i].name != b.groups[i].name) {
				return false
			}
		} 

		return true
	}
}
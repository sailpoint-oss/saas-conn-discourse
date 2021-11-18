import { Group } from "./group"

/**
 * User is a complete definition of a user, including entitlements
 */
export class User {
    id?: number
    username?: string
    email?: string
    active?: boolean
    admin?: boolean
    moderator?: boolean
    trust_level?: number
    title?: string
    groups?: Group[]
}
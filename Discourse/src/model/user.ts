/**
 * User is Discourse's representation of a user
 */
export class User {
    id?: number
    username?: string
    name?: string
    email?: string
    secondary_emails?: string[]
    active?: boolean
    admin?: boolean
    moderator?: boolean
    trust_level?: number
    title?: string
}
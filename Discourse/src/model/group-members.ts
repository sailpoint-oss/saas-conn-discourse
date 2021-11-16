import { User } from "./user"

/**
 * Group is Discourse's representation of a group, omitting the properties we don't need.
 */
 export class GroupMembers {
    members?: User[]
    meta?: {
       total: number
       limit: number
       offset: number
    }
 }
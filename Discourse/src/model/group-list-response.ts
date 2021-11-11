import { Group } from "./group"
/**
 * Group List Response is how a list of groups is represented
 * in the response of the Discourse API, omitting the properties
 * we don't need.
 */
 export class GroupListResponse {
    groups?: Group[]
    load_more_groups?: string
 }
import { Group } from "./group"
/**
 * Group Response is how a single group is represented
 * in the response of the Discourse API, omitting the properties
 * we don't need.
 */
 export class GroupResponse {
    group?: Group
 }
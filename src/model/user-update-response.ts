import { User } from "./user"

/**
 * The response received after updating a user
 */
export class UserUpdateResponse {
    success?: string
    user?: User
}
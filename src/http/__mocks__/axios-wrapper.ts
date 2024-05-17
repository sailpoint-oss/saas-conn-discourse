import { Config } from "../../model/config"
import groupListResponse from "./group-list-response.json"
import groupMembers from "./group-members.json";
import userEmail from "./user-email.json";
import user from "./user.json"
import userUsername from "./user-username.json"
import dummyResponse from "./dummy-response.json"
import userUpdateResponse from "./user-update-response.json"
import groupResponse  from "./group-response.json";
import { HTTP } from "../http";


export class AxiosWrapper implements HTTP {
    constructor(config: Config) {
        
    }
    async get<T = any>(url: string, data?: any) {
        const response = { ...dummyResponse };

        if (url.indexOf("/groups/group/members.json") === 0) {
            response.data = groupMembers;
        } else if (url.indexOf("/admin/users/list/staff.json") === 0) {
            response.data = groupListResponse;
        } else if (url.indexOf("/members.json") === 0) {
            response.data = groupMembers;
        } else if (url.indexOf("emails.json") > 0) {
            response.data = (<any>userEmail)[url];
        } else if (url.indexOf("/admin/users/") === 0) {
            response.data = (<any>user)[url]
        } else if (url.indexOf("/u/") === 0) {
            response.data = userUsername;
        } else if (url.indexOf("/groups.json") === 0) {
            if (data.params.page === 0) {
                response.data = groupListResponse;
            } else {
                response.data = {"groups": []}
            }
        } else if (url.indexOf("/groups/") === 0) {
            response.data = groupResponse
        } else {
            response.data = user;
        }

        return new Promise((resolve) => {
            process.nextTick(() =>
                resolve(response)
            );
        });
    }

    async post<T = any>(url: string, data?: any) {
        return new Promise((resolve) => {
            process.nextTick(() =>
                resolve({user})
            );
        });
    }

    async delete<T = any>(url: string, data?: any) {
        return new Promise((resolve) => {
            process.nextTick(() =>
                resolve(user)
            );
        });
    }

    async put<T = any>(url: string, data?: any) {
        const response = { ...dummyResponse };
        response.data = userUpdateResponse
        return new Promise((resolve) => {
            process.nextTick(() =>
                resolve(response)
            );
        });
    }
    async putFormData<T = any>(url: string, data?: any, headers?: any) {
        const response = { ...dummyResponse };
        response.data = userUpdateResponse
        return new Promise((resolve) => {
            process.nextTick(() =>
                resolve(response)
            );
        });
    }
}
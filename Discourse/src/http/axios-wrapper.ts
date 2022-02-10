import axios, { AxiosInstance } from "axios"
import axiosRetry from "axios-retry"
import { Config } from "../model/config"
import { HTTP } from "./http";

export class AxiosWrapper implements HTTP {
    httpClient: AxiosInstance;
    constructor(config: Config) {
        this.httpClient = axios.create({
            baseURL: config.baseUrl,
            headers: {
                'Api-Key': config.apiKey ? config.apiKey : '',
                'Api-Username': config.apiUsername ? config.apiUsername : ''
            }
        })

        // Wrap our Axios HTTP client in an Axios retry object to automatically
        // handle rate limiting.  By default, this logic will retry a given
        // API call 3 times before failing.  Read the documentation for 
        // axios-retry on NPM to see more configuration options.
        axiosRetry(this.httpClient, {
            retryDelay: () => {
                // Wait 30 seconds between calls to an API if the retryCondition
                // is met.
                return 30000
            },
            retryCondition: (error) => {
                // Only retry if the API call recieves an error code of 429
                if (error.response) {
                    return error.response!.status === 429
                } else {
                    return false;
                }
            }
        })
    }

    async get<T = any>(url: string, data?: any) {
        return this.httpClient.get<T>(url, data);
    }

    async post<T = any>(url: string, data?: any) {
        return this.httpClient.post<T>(url, data);
    }

    async delete<T = any>(url: string, data?: any) {
        return this.httpClient.delete<T>(url, data);
    }

    async put<T = any>(url: string, data?: any) {
        return this.httpClient.put<T>(url, data);
    }

}
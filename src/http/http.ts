
export interface HTTP {

    get<T = any>(url: string, data?: any): any

    post<T = any>(url: string, data?: any): any

    delete<T = any>(url: string, data?: any): any

    put<T = any>(url: string, data?: any): any

    putFormData<T = any>(url: string, data?: any, headers?: any) : any
}
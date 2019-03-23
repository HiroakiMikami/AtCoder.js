import * as request from "request"
import { ICache } from "./cache"
import { Session } from "./session"

export interface IResponse {
    statusCode: number
    body: any
}

export interface IOptions {
    session: Session
    headers?: { [index: string]: string }
}

export interface IClient {
    get(url: string, options: IOptions): Promise<IResponse>
    postForm(url: string, data: any, options: IOptions): Promise<IResponse>
}

export class HttpClient implements IClient {
    public async get(url: string, options: IOptions): Promise<IResponse> {
        const r = request.defaults({ jar: options.session.cookie })
        return await new Promise((resolve, reject) => {
            r({ url, headers: options.headers }, (err, response) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(response)
            })
        })
    }

    public async postForm(url: string, data: any, options: IOptions): Promise < IResponse > {
        const r = request.defaults({ jar: options.session.cookie })
        return await new Promise((resolve, reject) => {
            r.post({ url, headers: options.headers, form: data }, (err, response) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(response)
            })
        })
    }
}

export class CachedClient implements IClient {
    constructor(private client: IClient, private cache: ICache<string, IResponse>) {
    }
    public async clearCache() {
        await this.cache.clear()
        return
    }
    public async get(url: string, options: IOptions): Promise<IResponse> {
        const tag = encodeURIComponent(url)
        const entry = await this.cache.get(tag)
        if (entry !== null) {
            return entry
        }
        const response = await this.client.get(url, options)
        if (typeof response.body === "string") {
            return await this.cache.put(tag, response)
        }
        return response
    }
    public async postForm(url: string, data: any, options: IOptions): Promise < IResponse > {
        return this.client.postForm(url, data, options)
    }
}

export class ClientWithValidation implements IClient {
    constructor(private client: IClient) {
    }
    public async get(url: string, options: IOptions): Promise<IResponse> {
        const response = await this.client.get(url, options)
        if (response.statusCode >= 400) {
            throw response
        }
        return response
    }
    public async postForm(url: string, data: any, options: IOptions): Promise < IResponse > {
        const response = await this.client.postForm(url, data, options)
        if (response.statusCode >= 400)                 {
            throw response
        }
        return response
    }
}

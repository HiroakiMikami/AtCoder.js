import * as fs from "fs"
import * as path from "path"
import * as request from "request"
import { promisify } from "util"
import { Session } from "./session"

export interface IResponse {
    code: number
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
        const result: [request.Response, any] = await new Promise((resolve, reject) => {
            r({ url, headers: options.headers }, (err, response, body) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve([response, body])
            })
        })
        return { code: result[0].statusCode, body: result[1] }
    }

    public async postForm(url: string, data: any, options: IOptions): Promise<IResponse> {
        const r = request.defaults({ jar: options.session.cookie })
        const result: [request.Response, any] = await new Promise((resolve, reject) => {
            r.post({ url, headers: options.headers, form: data }, (err, response, body) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve([response, body])
            })
        })
        return { code: result[0].statusCode, body: result[1] }
    }
}

export class CachedClient implements IClient {
    private cachedContent: Map<string, IResponse>
    constructor(private client: IClient) {
        this.cachedContent = new Map()
    }
    public clearCache() {
        this.cachedContent.clear()
    }
    public async get(url: string, options: IOptions): Promise<IResponse> {
        if (this.cachedContent.has(url)) {
            return this.cachedContent.get(url)
        }
        const response = await this.client.get(url, options)
        this.cachedContent.set(url, response)
        return response
    }
    public postForm(url: string, data: any, options: IOptions): Promise<IResponse> {
        return this.client.postForm(url, data, options)
    }
}

export class FilesystemCachedClient implements IClient {
    constructor(private client: IClient, private cachedir: string) {}

    public async get(url: string, options: IOptions): Promise<IResponse> {
        const tag = encodeURIComponent(url)
        if (await promisify(fs.exists)(path.join(this.cachedir, tag))) {
            const content = await promisify(fs.readFile)(path.join(this.cachedir, tag), "utf8")
            try {
                const output = JSON.parse(content)
                return output as IResponse
            } catch (exception) {
                return this.client.get(url, options)
            }
        }

        const response = await this.client.get(url, options)
        if (!await promisify(fs.exists)(this.cachedir)) {
            await promisify(fs.mkdir)(this.cachedir)
        }
        if (typeof response.body === "string") {
            await promisify(fs.writeFile)(path.join(this.cachedir, tag), JSON.stringify(response))
        }

        return response

    }
    public postForm(url: string, data: any, options: IOptions): Promise<IResponse> {
        return this.client.postForm(url, data, options)
    }
}

export class ClientWithValidation implements IClient {
    constructor(private client: IClient) {
    }
    public async get(url: string, options: IOptions): Promise<IResponse> {
        const response = await this.client.get(url, options)
        if (response.code >= 400) {
            throw response
        }
        return response
    }
    public async postForm(url: string, data: any, options: IOptions): Promise<IResponse> {
        const response = await this.client.postForm(url, data, options)
        if (response.code >= 400) {
            throw response
        }
        return response
    }
}

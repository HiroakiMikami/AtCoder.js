import * as cheerio from "cheerio"
import { CompositeCache, FilesystemCache, ICache, MemoryCache } from "./cache"
import { CachedClient, ClientWithValidation, HttpClient, IClient, IResponse } from "./client"
import { Contest } from "./contest"
import { Session } from "./session"

export enum Language {
    English = 1,
    Japanese,
}

export interface IUrl {
    atcoder?: string
    atcoderProblems?: string
}

export interface IParams {
    url: { atcoder: string, atcoderProblems: string }
    client: IClient
    session: Session
    languages: ReadonlyArray<Language>
}

export interface ICacheOptions {
    maxMemoryEntries: number | null
    cachedir?: string
}

export interface IOptions {
    cache?: ICacheOptions
    rawClient?: IClient
    url?: IUrl
    languages?: ReadonlyArray<Language>
}

export class AtCoder {
    private params: IParams
    constructor(session: Session, options: IOptions) {
        const rawClient = options.rawClient || new ClientWithValidation(new HttpClient())
        const cacheOptions = options.cache || { maxMemoryEntries: 0 }
        const url = options.url || {}
        let client: IClient = rawClient
        const caches: Array<ICache<string, IResponse>> = []
        if (cacheOptions.maxMemoryEntries !== null) {
            caches.push(new MemoryCache(cacheOptions.maxMemoryEntries))
        }
        if (cacheOptions.cachedir !== null && cacheOptions.cachedir !== undefined) {
            caches.push(new FilesystemCache(cacheOptions.cachedir))
        }
        if (caches.length !== 0) {
            client = new CachedClient(client, new CompositeCache(caches))
        }
        this.params = {
            client,
            languages: options.languages || [Language.English],
            session,
            url: {
                atcoder: url.atcoder || "https://atcoder.jp",
                atcoderProblems: url.atcoderProblems || "https://kenkoooo.com/atcoder",
            },
        }
    }
    public async login(username: string, password: string): Promise<void> {
        const r = await this.params.client.get(`${this.params.url.atcoder}/login`, { session: this.params.session })
        const dom = cheerio.load(r.body)
        const csrfToken = dom(`input[name=csrf_token]`).attr("value")
        const r2 = await this.params.client.postForm(`${this.params.url.atcoder}/login`,
            { username, password, csrf_token: csrfToken }, { session: this.params.session })

        if (r2.body !== "") {
            throw new Error(`Login failed: ${r2.body}`)
        }

        // Clear all cache
        if (this.params.client instanceof CachedClient) {
            await this.params.client.clearCache()
        }
    }
    public async isLoggedIn(): Promise<boolean> {
        const page = await this.params.client.get(this.params.url.atcoder, { session: this.params.session })
        const dom = cheerio.load(page.body)
        if (dom('a[href="javascript:form_logout.submit()"]').length === 0) {
            return false
        } else {
            return true
        }
    }
    public async contests(): Promise<string[]> {
        const response = await this.params.client.get(`${this.params.url.atcoderProblems}/resources/contests.json`,
                                               { session: new Session() })
        const contests = JSON.parse(response.body.toString())
        return contests.map((data: { id: string }) => data.id)
    }
    public contest(id: string): Contest {
        return new Contest(id, this.params)
    }
}

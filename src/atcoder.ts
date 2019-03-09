import * as cheerio from "cheerio"
import { CachedClient, ClientWithValidation, FilesystemCachedClient, HttpClient, IClient } from "./client"
import { Contest } from "./contest"
import { Session } from "./session"

export interface IUrl {
    atcoder?: string
    atcoderProblems?: string
}

export interface IParams {
    url: { atcoder: string, atcoderProblems: string }
    client: IClient
    rawClient: IClient
    session: Session
}

export class AtCoder {
    private params: IParams
    constructor(session: Session,
                rawClient: IClient = new ClientWithValidation(new HttpClient()),
                url?: IUrl,
                cachedir?: string) {
        url = url || {}
        let client: IClient = new CachedClient(rawClient)
        if (cachedir !== null && cachedir !== undefined) {
            client = new FilesystemCachedClient(rawClient, cachedir)
        }
        this.params = {
            client,
            rawClient,
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
    }
    public async isLoggedIn(): Promise<boolean> {
        const page = await this.params.rawClient.get(this.params.url.atcoder, { session: this.params.session })
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

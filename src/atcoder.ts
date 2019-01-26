import * as cheerio from "cheerio"
import { CachedClient, ClientWithValidation, HttpClient, IClient } from "./client"
import { Contest } from "./contest"
import { Session } from "./session"

export interface IUrl {
    atcoder?: string
    atcoderProblems?: string
}

export class AtCoder {
    private url: { atcoder: string, atcoderProblems: string }
    private client: IClient
    constructor(private session: Session,
                private rawClient: IClient = new ClientWithValidation(new HttpClient()),
                url?: IUrl) {
        url = url || {}
        this.client = new CachedClient(rawClient)
        this.url = {
            atcoder: url.atcoder || "https://atcoder.jp",
            atcoderProblems: url.atcoderProblems || "https://kenkoooo.com/atcoder",
        }
    }
    public async login(username: string, password: string): Promise<void> {
        const r = await this.client.get(`${this.url.atcoder}/login`, { session: this.session })
        const dom = cheerio.load(r.body)
        const csrfToken = dom(`input[name=csrf_token]`).attr("value")
        const r2 = await this.client.postForm(`${this.url.atcoder}/login`,
            { username, password, csrf_token: csrfToken }, { session: this.session })

        if (r2.body !== "") {
            throw new Error(`Login failed: ${r2.body}`)
        }
    }
    public async isLoggedIn(): Promise<boolean> {
        const page = await this.rawClient.get(this.url.atcoder, { session: this.session })
        const dom = cheerio.load(page.body)
        if (dom('a[href="javascript:form_logout.submit()"]').length === 0) {
            return false
        } else {
            return true
        }
    }
    public async contests(): Promise<string[]> {
        const response = await this.client.get(`${this.url.atcoderProblems}/resources/contests.json`,
                                               { session: new Session() })
        const contests = JSON.parse(response.body.toString())
        return contests.map((data: { id: string }) => data.id)
    }
    public contest(id: string): Contest {
        return new Contest(id, this.session, this.client, this.url.atcoder)
    }
}

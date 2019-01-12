import * as cheerio from "cheerio"
import { HttpClient, IClient } from "./client"
import { Session } from "./session"

export class AtCoder {
    constructor(private session: Session, private client: IClient = new HttpClient(),
                private domain: string = "https://atcoder.jp") {}
    public async login(username: string, password: string): Promise<void> {
        const r = await this.client.get(`${this.domain}/login`, { session: this.session })
        const dom = cheerio.load(r.body)
        const csrfToken = dom(`input[name=csrf_token]`).attr("value")
        const r2 = await this.client.postForm(`${this.domain}/login`,
            { username, password, csrf_token: csrfToken }, { session: this.session })

        if (r2.body !== "") {
            throw new Error(`Login failed: ${r2.body}`)
        }
    }
}

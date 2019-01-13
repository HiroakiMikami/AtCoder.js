import * as cheerio from "cheerio"
import { IClient } from "./client"
import { Session } from "./session"

export class Contest {
    private tasksPage: Promise<CheerioStatic> | null
    constructor(private id: string, private session: Session, private client: IClient, private atcoderUrl: string) {
        this.tasksPage = null
    }

    public async name(): Promise<string> {
        this.sendRequest()
        const tasks = await this.tasksPage
        return tasks(`a.contest-title`).text()
    }
    public async problems(): Promise<string[]> {
        this.sendRequest()
        const tasks = await this.tasksPage
        const problems = tasks(`table tbody td.text-center a`).map((_, elem) => tasks(elem).attr("href")).get()
        return problems.map((problem) => problem.split("/").slice(-1)[0])
    }
    private sendRequest() {
        if (this.tasksPage === null) {
            this.tasksPage = this.client.get(`${this.atcoderUrl}/contests/${this.id}/tasks?lang=en`,
                                             { session: this.session })
                .then((response) => cheerio.load(response.body))
        }
    }
}

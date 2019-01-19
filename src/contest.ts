import * as cheerio from "cheerio"
import { IClient } from "./client"
import { Problem } from "./problem"
import { Session } from "./session"
import { ISubmissionInfo, Status, Submission, toStatus } from "./submission"

export interface ISubmissionQuery {
    task?: string
    language?: string
    status?: Status
    user?: string
}

export class Contest {
    private tasksPage: Promise<CheerioStatic> | null
    constructor(private id: string, private session: Session, private client: IClient, private atcoderUrl: string) {
        this.tasksPage = null
    }

    public async name(): Promise<string> {
        const tasks = await this.sendRequestToTasks()
        return tasks(`a.contest-title`).text()
    }
    public async problems(): Promise<string[]> {
        const tasks = await this.sendRequestToTasks()
        const problems = tasks(`table tbody td.text-center a`).map((_, elem) => tasks(elem).attr("href")).get()
        return problems.map((problem) => problem.split("/").slice(-1)[0])
    }
    public problem(id: string) {
        return new Problem(this.id, id, this.session, this.client, this.atcoderUrl)
    }
    public submission(id: string) {
        return new Submission(this.id, id, this.session, this.client, this.atcoderUrl)
    }
    public async mySubmissions(query?: ISubmissionQuery): Promise<ISubmissionInfo[]> {
        query = query || {}
        const response = await this.client.get(`${this.atcoderUrl}/contests/${this.id}/submissions/me?` +
            `f.Task=${query.task || ""}&` +
            `f.Language=${query.language || ""}&` +
            `f.Status=${query.status || ""}&` +
            `f.User=${query.user || ""}` +
            `&lang=en`,
            { session: this.session })
        const submissions = cheerio.load(response.body)

        return submissions("table tbody tr").map((_, elem) => {
            const children = submissions(elem).children().get()
            return {
                codeSize: {
                    unit: submissions(children[5]).text().split(" ")[1],
                    value: Number(submissions(children[5]).text().split(" ")[0]),
                },
                execTime: {
                    unit: submissions(children[7]).text().split(" ")[1],
                    value: Number(submissions(children[7]).text().split(" ")[0]),
                },
                id: submissions(children[9]).find("a").attr("href").split("/").slice(-1)[0],
                language: submissions(children[3]).text(),
                memory: {
                    unit: submissions(children[8]).text().split(" ")[1],
                    value: Number(submissions(children[8]).text().split(" ")[0]),
                },
                status: toStatus(submissions(children[6]).text()),
                submissionTime: new Date(submissions(children[0]).text()),
                task: submissions(children[1]).find("a").attr("href").split("/").slice(-1)[0],
                user: submissions(children[2]).text(),
            }
        }).get()
    }
    private sendRequestToTasks() {
        if (this.tasksPage === null) {
            this.tasksPage = this.client.get(`${this.atcoderUrl}/contests/${this.id}/tasks?lang=en`,
                                             { session: this.session })
                .then((response) => cheerio.load(response.body))
        }
        return this.tasksPage
    }
}

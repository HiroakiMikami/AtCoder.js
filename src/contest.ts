import * as cheerio from "cheerio"
import { IClient } from "./client"
import { Session } from "./session"
import { ISubmissionInfo, Status, Submission, toStatus } from "./submission"
import { ITaskInfo, Task } from "./task"

export interface ISubmissionQuery {
    task?: string
    language?: string
    status?: Status
    user?: string
    page?: number
}

export interface ISubmissionPage {
    numberOfPages: number
    submissions: ISubmissionInfo[]
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
    public async tasks(): Promise<ITaskInfo[]> {
        const tasks = await this.sendRequestToTasks()
        const list = tasks(`table tbody tr`)
        return list.map((_, elem) => {
            const children = tasks(elem).children()
            const id = tasks(children[0]).find("a").attr("href").split("/").slice(-1)[0]
            const name = `${tasks(children[0]).text()} - ${tasks(children[1]).text()}`
            const timeLimit = {
                unit: tasks(children[2]).text().split(" ")[1],
                value: Number(tasks(children[2]).text().split(" ")[0]),
            }
            const memoryLimit = {
                unit: tasks(children[3]).text().split(" ")[1],
                value: Number(tasks(children[3]).text().split(" ")[0]),
            }
            return {id, name, timeLimit, memoryLimit }
        }).get()
    }
    public task(id: string) {
        return new Task(this.id, id, this.session, this.client, this.atcoderUrl)
    }
    public submission(id: string) {
        return new Submission(this.id, id, this.session, this.client, this.atcoderUrl)
    }
    public async submissions(query?: ISubmissionQuery): Promise<ISubmissionPage> {
        query = query || {}
        const response = await this.client.get(`${this.atcoderUrl}/contests/${this.id}/submissions?` +
            `f.Task=${query.task || ""}&` +
            `f.Language=${query.language || ""}&` +
            `f.Status=${query.status || ""}&` +
            `f.User=${query.user || ""}&` +
            `page=${query.page || 1}&` +
            `lang=en`,
            { session: this.session })
        const submissions = cheerio.load(response.body)

        return this.parseSubmissions(submissions)
    }
    public async mySubmissions(query?: ISubmissionQuery): Promise<ISubmissionPage> {
        query = query || {}
        const response = await this.client.get(`${this.atcoderUrl}/contests/${this.id}/submissions/me?` +
            `f.Task=${query.task || ""}&` +
            `f.Language=${query.language || ""}&` +
            `f.Status=${query.status || ""}&` +
            `f.User=${query.user || ""}&` +
            `page=${query.page || 1}&` +
            `lang=en`,
            { session: this.session })
        const submissions = cheerio.load(response.body)

        return this.parseSubmissions(submissions)
    }
    private parseSubmissions(submissions: CheerioStatic): ISubmissionPage {
        const ss = submissions("table tbody tr").map((_, elem) => {
            const children = submissions(elem).children().get()
            if (children.length === 10) {
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
            } else {
                return {
                    codeSize: {
                        unit: submissions(children[5]).text().split(" ")[1],
                        value: Number(submissions(children[5]).text().split(" ")[0]),
                    },
                    id: submissions(children[7]).find("a").attr("href").split("/").slice(-1)[0],
                    language: submissions(children[3]).text(),
                    status: toStatus(submissions(children[6]).text()),
                    submissionTime: new Date(submissions(children[0]).text()),
                    task: submissions(children[1]).find("a").attr("href").split("/").slice(-1)[0],
                    user: submissions(children[2]).text(),
                }
            }
        }).get()

        const pages = submissions(submissions(".pagination").get()[0]).children()
        const lastPage = pages.slice(-1)[0]
        const numberOfPages = Number(submissions(lastPage).find("a").text())
        return { numberOfPages, submissions: ss }
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

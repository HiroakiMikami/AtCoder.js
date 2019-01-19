import * as cheerio from "cheerio"
import { IClient } from "./client"
import { Session } from "./session"
import { INumberWithUnits } from "./utils"

export interface IFormat {
    input: string
    output: string
}
export interface ISample {
    input: string
    output: string
    notes: string
}

export interface ITaskInfo {
    id: string
    name: string
    timeLimit: INumberWithUnits
    memoryLimit: INumberWithUnits
}

export class Task {
    private tasksPage: Promise<CheerioStatic> | null
    constructor(private contestId: string, private id: string,
                private session: Session, private client: IClient, private atcoderUrl: string) {
        this.tasksPage = null
    }
    public async name(): Promise<string> {
        const tasks = await this.sendRequest()
        return tasks(`span.h2`).text()
    }
    public async score(): Promise<number> {
        const tasks = await this.sendRequest()
        const score = tasks("div#task-statement span.lang-en>p var").first().text()
        return Number(score)
    }
    public async problemStatement(): Promise<string> {
        const tasks = await this.sendRequest()
        return this.toHtml(tasks,
                this.findSection(tasks, "div#task-statement span.lang-en>div.part", "Problem Statement"))
    }
    public async constraints(): Promise<string> {
        const tasks = await this.sendRequest()
        return this.toHtml(tasks, this.findSection(tasks, "div#task-statement span.lang-en>div.part", "Constraints"))
    }
    public async format(): Promise<IFormat> {
        const tasks = await this.sendRequest()
        const input = this.toHtml(tasks,
                this.findSection(tasks, "div#task-statement span.lang-en>div.io-style>div.part", "Input"))
        const output = this.toHtml(tasks,
                this.findSection(tasks, "div#task-statement span.lang-en>div.io-style>div.part", "Output"))
        return { input, output }
    }
    public async examples(): Promise<ISample[]> {
        const tasks = await this.sendRequest()
        const samples: ISample[] = []
        let n = 1
        while (true) {
            const input = this.findSection(tasks, "div#task-statement span.lang-en>div.part", `Sample Input ${n}`)
            const output = this.findSection(tasks, "div#task-statement span.lang-en>div.part", `Sample Output ${n}`)
            const sample = {
                input: this.toHtml(tasks, input, "section>pre:nth-child(2)"),
                notes: this.toHtml(tasks, input, "section>:nth-child(n+3)") +
                    this.toHtml(tasks, output, "section>:nth-child(n+3)"),
                output: this.toHtml(tasks, output, "section>pre:nth-child(2)"),
            }
            if (sample.input === "" && sample.output === "") { break }

            n += 1
            samples.push(sample)
        }
        return samples
    }
    private findSection(root: CheerioStatic, selector: string, title: string): Cheerio {
        return root(selector).filter((_, elem) => {
            return title === root(elem).children().find("section>h3").text()
        })
    }
    private toHtml(root: CheerioStatic, dom: Cheerio, selector: string= "section>:not(h3)"): string {
        return dom.map((_, elem) => {
            return root.html(root(elem).children().find(selector))
        }).get().join("\n")
    }
    private sendRequest() {
        if (this.tasksPage === null) {
            this.tasksPage = this.client.get(`${this.atcoderUrl}/contests/${this.contestId}/tasks/${this.id}?lang=en`,
                                             { session: this.session })
                .then((response) => cheerio.load(response.body))
        }
        return this.tasksPage
    }
}

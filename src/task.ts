import * as cheerio from "cheerio"
import { IParams, Language } from "./atcoder"
import { INumberWithUnits, toNumberWithUnits } from "./utils"

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
    private static TITLES() {
        return {
            constraints: [
                [Language.English, "Constraints"], [Language.Japanese, "制約"],
            ] as ReadonlyArray<[Language, string]>,
            input: [
                [Language.English, "Input"], [Language.Japanese, "入力"],
            ] as ReadonlyArray<[Language, string]>,
            output: [
                [Language.English, "Output"], [Language.Japanese, "出力"],
            ] as ReadonlyArray<[Language, string]>,
            problemStatement: [
                [Language.English, "Problem Statement"], [Language.Japanese, "問題文"],
            ] as ReadonlyArray<[Language, string]>,
            sampleInput: [
                [Language.English, "Sample Input"], [Language.Japanese, "入力例"],
            ] as ReadonlyArray<[Language, string]>,
            sampleOutput: [
                [Language.English, "Sample Output"], [Language.Japanese, "出力例"],
            ] as ReadonlyArray<[Language, string]>,
        }
    }

    private tasksPage: Promise<CheerioStatic> | null
    private languages: ReadonlySet<Language>
    constructor(private contestId: string, private id: string,
                private params: IParams) {
        this.tasksPage = null
        this.languages = params.languages
    }
    public async info(): Promise<ITaskInfo> {
        const tasks = await this.sendRequest()
        const name = tasks(`span.h2`).text()
        const limits = tasks("div.col-sm-12>p").text()

        return {
            id: this.id,
            memoryLimit: toNumberWithUnits(limits.split(" / ")[1].split(": ")[1]),
            name,
            timeLimit: toNumberWithUnits(limits.split(" / ")[0].split(": ")[1]),
        }
    }
    public async score(): Promise<number> {
        const tasks = await this.sendRequest()
        const score = tasks("div#task-statement span.lang-en>p var").first().text()
        return Number(score)
    }
    public async problemStatement(): Promise<string> {
        const tasks = await this.sendRequest()
        const titles = Task.TITLES().problemStatement
            .filter((xs) => this.languages.has(xs[0]))
            .map((xs) => RegExp(`^${xs[1]}$`))
        return this.toHtml(tasks,
                this.findSection(tasks, "div#task-statement span.lang-en>div.part", titles))
    }
    public async constraints(): Promise<string> {
        const tasks = await this.sendRequest()
        const titles = Task.TITLES().constraints
            .filter((xs) => this.languages.has(xs[0]))
            .map((xs) => RegExp(`^${xs[1]}$`))
        return this.toHtml(tasks, this.findSection(tasks, "div#task-statement span.lang-en>div.part", titles))
    }
    public async format(): Promise<IFormat> {
        const tasks = await this.sendRequest()
        const inputTitles = Task.TITLES().input
            .filter((xs) => this.languages.has(xs[0]))
            .map((xs) => RegExp(`^${xs[1]}$`))
        const input = this.toHtml(tasks,
                this.findSection(tasks, "div#task-statement span.lang-en>div.io-style>div.part", inputTitles))
        const outputTitles = Task.TITLES().output
            .filter((xs) => this.languages.has(xs[0]))
            .map((xs) => RegExp(`^${xs[1]}$`))
        const output = this.toHtml(tasks,
                this.findSection(tasks, "div#task-statement span.lang-en>div.io-style>div.part", outputTitles))
        return { input, output }
    }
    public async examples(): Promise<ISample[]> {
        const tasks = await this.sendRequest()
        const samples: ISample[] = []
        let n = 1
        while (true) {
            const inputTitles = Task.TITLES().sampleInput
                .filter((xs) => this.languages.has(xs[0]))
                .map((xs) => RegExp(`${xs[1]} ${n}`))
            const input =
                this.findSection(tasks, "div#task-statement span.lang-en>div.part", inputTitles)
            const outputTitles = Task.TITLES().sampleOutput
                .filter((xs) => this.languages.has(xs[0]))
                .map((xs) => RegExp(`${xs[1]} ${n}`))
            const output =
                this.findSection(tasks, "div#task-statement span.lang-en>div.part", outputTitles)
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
    private findSection(root: CheerioStatic, selector: string, title: ReadonlyArray<RegExp>): Cheerio {
        return root(selector).filter((_, elem) => {
            const x = root(elem).children().find("section>h3").text()
            return title.some((t) => t.test(x))
        })
    }
    private toHtml(root: CheerioStatic, dom: Cheerio, selector: string= "section>:not(h3)"): string {
        return dom.map((_, elem) => {
            return root.html(root(elem).children().find(selector))
        }).get().join("\n")
    }
    private sendRequest() {
        if (this.tasksPage === null) {
            this.tasksPage = this.params.client.get(
                    `${this.params.url.atcoder}/contests/${this.contestId}/tasks/${this.id}?lang=en`,
                    { session: this.params.session })
                .then((response) => cheerio.load(response.body))
        }
        return this.tasksPage
    }
}

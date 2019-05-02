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
    private static LANG() {
        return new Map([
            [Language.English, "lang-en"], [Language.Japanese, "lang-ja"],
        ])
    }
    private static TITLES() {
        return {
            constraints: new Map([
                [Language.English, "Constraints"], [Language.Japanese, "制約"],
            ]),
            input: new Map([
                [Language.English, "Input"], [Language.Japanese, "入力"],
            ]),
            output: new Map([
                [Language.English, "Output"], [Language.Japanese, "出力"],
            ]),
            problemStatement: new Map([
                [Language.English, "Problem Statement"], [Language.Japanese, "問題文"],
            ]),
            sampleInput: new Map([
                [Language.English, "Sample Input"], [Language.Japanese, "入力例"],
            ]),
            sampleOutput: new Map([
                [Language.English, "Sample Output"], [Language.Japanese, "出力例"],
            ]),
        }
    }

    private tasksPage: Promise<CheerioStatic> | null
    private languages: ReadonlyArray<Language>
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
        const lang = await this.language()
        const tasks = await this.sendRequest()
        const title = RegExp(`^${Task.TITLES().problemStatement.get(lang)}$`)
        return this.toHtml(tasks,
            this.findSection(tasks, `div#task-statement span.${Task.LANG().get(lang)}>div.part`, title))
    }
    public async constraints(): Promise<string> {
        const lang = await this.language()
        const tasks = await this.sendRequest()
        const title = RegExp(`^${Task.TITLES().constraints.get(lang)}$`)
        return this.toHtml(tasks,
            this.findSection(tasks, `div#task-statement span.${Task.LANG().get(lang)}>div.part`, title))
    }
    public async format(): Promise<IFormat> {
        const lang = await this.language()
        const tasks = await this.sendRequest()
        const inputTitle = RegExp(`^${Task.TITLES().input.get(lang)}$`)
        const input = this.toHtml(tasks,
                this.findSection(tasks,
                    `div#task-statement span.${Task.LANG().get(lang)}>div.io-style>div.part`, inputTitle))
        const outputTitle = RegExp(`^${Task.TITLES().output.get(lang)}$`)
        const output = this.toHtml(tasks,
                this.findSection(tasks,
                    `div#task-statement span.${Task.LANG().get(lang)}>div.io-style>div.part`, outputTitle))
        return { input, output }
    }
    public async examples(): Promise<ISample[]> {
        const lang = await this.language()
        const tasks = await this.sendRequest()
        const samples: ISample[] = []
        let n = 1
        while (true) {
            const inputTitle = RegExp(`${Task.TITLES().sampleInput.get(lang)} ${n}`)
            const input =
                this.findSection(tasks, `div#task-statement span.${Task.LANG().get(lang)}>div.part`, inputTitle)
            const outputTitle = RegExp(`${Task.TITLES().sampleOutput.get(lang)} ${n}`)
            const output =
                this.findSection(tasks, `div#task-statement span.${Task.LANG().get(lang)}>div.part`, outputTitle)
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
    private async language(): Promise<Language | null> {
        const root = await this.sendRequest()
        for (const lang of this.languages) {
            if (root(`div#task-statement span.${Task.LANG().get(lang)}`).length !== 0) {
                return lang
            }
        }
        return null
    }
    private findSection(root: CheerioStatic, selector: string, title: RegExp): Cheerio {
        return root(selector).filter((_, elem) => {
            const x = root(elem).children().find("section>h3").text()
            return title.test(x)
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

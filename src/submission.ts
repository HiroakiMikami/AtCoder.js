import * as cheerio from "cheerio"
import { IParams } from "./atcoder"
import { INumberWithUnits, toNumberWithUnits } from "./utils"

export enum Status {
    WJ = "WJ",
    AC = "AC",
    WA = "WA", IE = "IE", OLE = "OLE", RE = "RE", TLE = "TLE", MLE = "MLE", CE = "CE",
}
export function toStatus(value: any): Status[keyof Status] | undefined {
    for (const key in Status) {
        if (Status.hasOwnProperty(key) && Status[key] === value) {
            return Status[key]
        }
    }
    return undefined
}

export interface ISubmissionInfo {
    id: string
    submissionTime: Date
    task: string
    user: string
    language: string
    codeSize: INumberWithUnits
    status: Status
    execTime?: INumberWithUnits
    memory?: INumberWithUnits
}

export interface ITestCaseSet {
    name: string
    score: number
    maxScore: number
    testCases: string[]
}
export interface ITestResult {
    name: string
    status: Status,
    execTime: INumberWithUnits
    memory: INumberWithUnits
}

export class Submission {
    public submissionPage: Promise<CheerioStatic> | null
    constructor(private contestId: string, private id: string,
                private params: IParams) {
        this.submissionPage = null
    }
    public async sourceCode(): Promise<string> {
        const page = await this.sendRequest()
        return page("#submission-code").text()
    }
    public async info(): Promise<ISubmissionInfo> {
        const page = await this.sendRequest()
        const infoTable = page("table").get()[0]
        const data = page(infoTable).find("table tr td:nth-child(2)").get()
        if (data.length === 9) {
            return {
                codeSize: toNumberWithUnits(page(data[5]).text()),
                execTime: toNumberWithUnits(page(data[7]).text()),
                id: this.id,
                language: page(data[3]).text(),
                memory: toNumberWithUnits(page(data[8]).text()),
                status: (toStatus(page(data[6]).text())) as Status,
                submissionTime: new Date(page(data[0]).text()),
                task:  page(data[1]).find("a").attr("href").split("/").slice(-1)[0],
                user: page(data[2]).text(),
            }
        } else {

            return {
                codeSize: toNumberWithUnits(page(data[5]).text()),
                id: this.id,
                language: page(data[3]).text(),
                status: (toStatus(page(data[6]).text())) as Status,
                submissionTime: new Date(page(data[0]).text()),
                task:  page(data[1]).find("a").attr("href").split("/").slice(-1)[0],
                user: page(data[2]).text(),
            }
        }
    }
    public async testCaseSets(): Promise<ITestCaseSet[] | null> {
        const page = await this.sendRequest()
        const infoTable = page("table").get()[1]

        if (page(infoTable).children().length === 0) {
            return null
        }
        return page(infoTable).find("table tr").map((_, elem) => {
            const children = page(elem).children()
            const name = page(children[0]).text()
            const score = Number(page(children[1]).text().split("/")[0])
            const maxScore = Number(page(children[1]).text().split("/")[1])
            const testCases = page(children[2]).text().split(",").map((x) => x.replace(" ", ""))
            return { name, score, maxScore, testCases }
        }).get()
    }
    public async results(): Promise<ITestResult[] | null> {
        const page = await this.sendRequest()
        const infoTable = page("table").get()[2]

        if (page(infoTable).children().length === 0) {
            return null
        }
        return page(infoTable).find("table tr").map((_, elem) => {
            const children = page(elem).children()
            const name = page(children[0]).text()
            const status = toStatus(page(children[1]).text())
            const execTime = toNumberWithUnits(page(children[2]).text())
            const memory = toNumberWithUnits(page(children[3]).text())
            return { name, status, execTime, memory }
        }).get()
    }
    public async compileError(): Promise<string | null> {
        const page = await this.sendRequest()
        const elems = page("div.col-sm-12:not(#contst-nav-tabs)").children()
        let retval = null
        elems.each((index, elem) => {
            if (page(elem).text() === "Compile Error") {
                retval = page(elems[index + 1]).text()
            }
        })

        return retval
    }

    private sendRequest() {
        if (this.submissionPage === null) {
            this.submissionPage = this.params.client.get(
                `${this.params.url.atcoder}/contests/${this.contestId}/submissions/${this.id}?lang=en`,
                { session: this.params.session },
            ).then((response) => cheerio.load(response.body))
        }
        return this.submissionPage
    }
}

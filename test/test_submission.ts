import * as chai from "chai"
const should = chai.should()

import { IOptions } from "../src/client"
import { Session } from "../src/session"
import { Status, Submission } from "../src/submission"

describe("Submission", () => {
    describe("#sourceCode", () => {
        it("return the source code", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<pre id=submission-code>" +
                        "<ol><li>line1\n</li><li>line2\n</li></ol></pre>",
                        code: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const submission = new Submission("c1", "0", session, mockClient, "http://tmp")
            const code = await submission.sourceCode()
            code.should.equal("line1\nline2\n")

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/0?lang=en", { session }],
            ])
        })
    })
    describe("#info", () => {
        it("get the list of the my submissions", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<table><tbody>" +
                        "<tr><td></td><td>2019-01-01 00:00:00</td></tr>" +
                        "<tr><td></td><td><a href='contests/c1/tasks/foo'></a></td></tr>" +
                        "<tr><td></td><td>User</td></tr>" +
                        "<tr><td></td><td>Lang</td></tr>" +
                        "<tr><td></td><td>0</td></tr>" +
                        "<tr><td></td><td>100 Byte</td></tr>" +
                        "<tr><td></td><td>AC</td></tr>" +
                        "<tr><td></td><td>1 ms</td></tr>" +
                        "<tr><td></td><td>1 KB</td></tr>" +
                        "</tbody></table>",
                        code: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const submission = new Submission("c1", "0", session, mockClient, "http://tmp")
            const info = await submission.info()
            info.should.deep.equal(
                {
                    codeSize: { value: 100, unit: "Byte" }, execTime: { value: 1, unit: "ms" }, id: "0",
                    language: "Lang", memory: { value: 1, unit: "KB" },
                    status: "AC", submissionTime: new Date("2019-01-01 00:00:00"), task: "foo", user: "User",
                })

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/0?lang=en", { session }],
            ])

        })
        it("get the list of the my submissions when the status is CE", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<table><tbody>" +
                        "<tr><td></td><td>2019-01-01 00:00:00</td></tr>" +
                        "<tr><td></td><td><a href='contests/c1/tasks/foo'></a></td></tr>" +
                        "<tr><td></td><td>User</td></tr>" +
                        "<tr><td></td><td>Lang</td></tr>" +
                        "<tr><td></td><td>0</td></tr>" +
                        "<tr><td></td><td>100 Byte</td></tr>" +
                        "<tr><td></td><td>CE</td></tr>" +
                        "</tbody></table>",
                        code: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const submission = new Submission("c1", "0", session, mockClient, "http://tmp")
            const info = await submission.info()
            info.should.deep.equal(
                {
                    codeSize: { value: 100, unit: "Byte" },  id: "0",
                    language: "Lang",
                    status: "CE", submissionTime: new Date("2019-01-01 00:00:00"), task: "foo", user: "User",
                })

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/0?lang=en", { session }],
            ])

        })
    })
    describe("#testCaseSets", () => {
        it("get the set of the test cases", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<table></table>" +
                        "<table><tbody>" +
                        "<tr><td>S1</td><td>0 / 100</td><td>a01</td></tr>" +
                        "<tr><td>S2</td><td>100 / 100</td><td>b01, b02</td></tr>" +
                        "</tbody></table>",
                        code: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const submission = new Submission("c1", "0", session, mockClient, "http://tmp")
            const s = await submission.testCaseSets()
            s.should.deep.equal([
                { name: "S1", score: 0, maxScore: 100, testCases: ["a01"] },
                { name: "S2", score: 100, maxScore: 100, testCases: ["b01", "b02"] },
            ])

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/0?lang=en", { session }],
            ])

        })
        it("return null if the status is CE", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ code: 200, body: "<table></table>" })

                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const submission = new Submission("c1", "0", session, mockClient, "http://tmp")
            const s = await submission.testCaseSets()
            should.not.exist(s)

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/0?lang=en", { session }],
            ])

        })
    })
    describe("#results", () => {
        it("get the results of all test cases", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<table></table><table></table>" +
                        "<table><tbody>" +
                        "<tr><td>a01</td><td>WA</td><td>1 ms</td><td>1 KB</td></tr>" +
                        "<tr><td>b01</td><td>AC</td><td>1 ms</td><td>1 KB</td></tr>" +
                        "<tr><td>b02</td><td>AC</td><td>1 ms</td><td>1 KB</td></tr>" +
                        "</tbody></table>",
                        code: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const submission = new Submission("c1", "0", session, mockClient, "http://tmp")
            const r = await submission.results()
            r.should.deep.equal([
                { name: "a01", status: Status.WA, execTime: { unit: "ms", value: 1}, memory: { unit: "KB", value: 1 }},
                { name: "b01", status: Status.AC, execTime: { unit: "ms", value: 1}, memory: { unit: "KB", value: 1 }},
                { name: "b02", status: Status.AC, execTime: { unit: "ms", value: 1}, memory: { unit: "KB", value: 1 }},
            ])

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/0?lang=en", { session }],
            ])

        })
        it("return null if the status is CE", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ code: 200, body: "<table></table>" })

                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const submission = new Submission("c1", "0", session, mockClient, "http://tmp")
            const r = await submission.results()
            should.not.exist(r)

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/0?lang=en", { session }],
            ])

        })
    })

    describe("#compileError", () => {
        it("get the error message", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<div id=contest-nav-tabs class=col-sm-12></div>" +
                        "<div class=col-sm-12>" +
                        "<h4>Compile Error</h4>" +
                        "<pre>error message</pre>" +
                        "</div>",
                        code: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const submission = new Submission("c1", "0", session, mockClient, "http://tmp")
            const msg = await submission.compileError()
            msg.should.deep.equal("error message")

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/0?lang=en", { session }],
            ])

        })
        it("return null if the status is not CE", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<div id=contest-nav-tabs class=col-sm-12></div>" +
                        "<div class=col-sm-12></div>",
                        code: 200,
                    })

                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const submission = new Submission("c1", "0", session, mockClient, "http://tmp")
            const msg = await submission.compileError()
            should.not.exist(msg)

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/0?lang=en", { session }],
            ])

        })
    })
})

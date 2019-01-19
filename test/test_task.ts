import * as chai from "chai"
chai.should()

import { IOptions } from "../src/client"
import { Session } from "../src/session"
import { Task } from "../src/task"

describe("Task", () => {
    describe("#info", () => {
        it("return the task info", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<div class=col-sm-12>" +
                        "<span class='h2'>Title</a></span>" +
                        "<p>Time Limit: 1 sec / Memory Limit: 1024 MB" +
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
            const task = new Task("c1", "p1", session, mockClient, "http://tmp")
            const name = await task.info()
            name.should.deep.equal({
                id: "p1",
                memoryLimit: { unit: "MB", value: 1024 },
                name: "Title",
                timeLimit: { unit: "sec", value: 1 },
            })

            history.should.deep.equal([
                ["http://tmp/contests/c1/tasks/p1?lang=en", { session }],
            ])
        })
    })
    describe("#score", () => {
        it("return the score as number", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<div id=task-statement><span class=lang-en>" +
                            "<p><var>100</var></p><p><var>N</var></p>" +
                            "</span></div>",
                        code: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const task = new Task("c1", "p1", session, mockClient, "http://tmp")
            const score = await task.score()
            score.should.equal(100)

            history.should.deep.equal([
                ["http://tmp/contests/c1/tasks/p1?lang=en", { session }],
            ])
        })
    })
    describe("#problemStatement", () => {
        it("return the task statement", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<div id=task-statement><span class=lang-en>" +
                            "<div class=part><section><h3>Problem Statement</h3>" +
                            "<p>S1.</p><p>S2.</p>" +
                            "</section></div>" +
                            "</span></div>",
                        code: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const task = new Task("c1", "p1", session, mockClient, "http://tmp")
            const statement = await task.problemStatement()
            statement.should.equal("<p>S1.</p><p>S2.</p>")

            history.should.deep.equal([
                ["http://tmp/contests/c1/tasks/p1?lang=en", { session }],
            ])
        })
    })
    describe("#constraints", () => {
        it("return the constraints", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<div id=task-statement><span class=lang-en>" +
                            "<div class=part><section><h3>Constraints</h3>" +
                            "<p>S1.</p><p>S2.</p>" +
                            "</section></div>" +
                            "</span></div>",
                        code: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const task = new Task("c1", "p1", session, mockClient, "http://tmp")
            const c = await task.constraints()
            c.should.equal("<p>S1.</p><p>S2.</p>")

            history.should.deep.equal([
                ["http://tmp/contests/c1/tasks/p1?lang=en", { session }],
            ])
        })
    })
    describe("#format", () => {
        it("return the format of the input and the output", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<div id=task-statement><span class=lang-en>" +
                            "<div class=io-style><div class=part>" +
                            "<section><h3>Input</h3>" +
                            "<p>I1.</p><p>I2.</p>" +
                            "</div><div class=part>" +
                            "<section><h3>Output</h3>" +
                            "<p>O1.</p><p>O2.</p>" +
                            "</section></div></div>" +
                            "</span></div>",
                        code: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const task = new Task("c1", "p1", session, mockClient, "http://tmp")
            const f = await task.format()
            f.should.deep.equal({
                input: "<p>I1.</p><p>I2.</p>",
                output: "<p>O1.</p><p>O2.</p>",
            })

            history.should.deep.equal([
                ["http://tmp/contests/c1/tasks/p1?lang=en", { session }],
            ])
        })
    })
    describe("#examples", () => {
        it("return the list of the examples", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<div id=task-statement><span class=lang-en>" +
                            "<div class=part>" +
                            "<section><h3>Sample Input 1</h3>" +
                            "<pre>Input</pre>" +
                            "<p>I1.</p><p>I2.</p>" +
                            "</section></div>" +
                            "<div class=part>" +
                            "<section><h3>Sample Output 1</h3>" +
                            "<pre>Output</pre>" +
                            "<pre>N</pre>" +
                            "<p>O1.</p><p>O2.</p>" +
                            "</section></div>" +
                            "</span></div>",
                        code: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const task = new Task("c1", "p1", session, mockClient, "http://tmp")
            const e = await task.examples()
            e.should.deep.equal([{
                input: "<pre>Input</pre>",
                notes: "<p>I1.</p><p>I2.</p><pre>N</pre><p>O1.</p><p>O2.</p>",
                output: "<pre>Output</pre>",
            }])

            history.should.deep.equal([
                ["http://tmp/contests/c1/tasks/p1?lang=en", { session }],
            ])
        })
    })
})

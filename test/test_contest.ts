import * as chai from "chai"
chai.should()

import { AtCoder } from "../src/atcoder"
import { IOptions } from "../src/client"
import { Session } from "../src/session"
import { Status } from "../src/submission"

describe("Contest", () => {
    describe("#name", () => {
        it("return the contest name", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ statusCode: 200, body: "<a class='contest-title'>Title</a>" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
            }
            const session = new Session()
            const atcoder = new AtCoder(session, { rawClient: mockClient, url: { atcoder: "http://tmp" } })
            const contest = atcoder.contest("c1")
            const name = await contest.name()
            name.should.equal("Title")

            history.should.deep.equal([
                ["http://tmp/contests/c1/tasks?lang=en", { session }],
            ])
        })
    })
    describe("#tasks", () => {
        it("get the list of the tasks", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<table><tbody>" +
                        "<tr>" +
                        "<td><a href='contests/c1/tasks/foo'>A</a></td>" +
                        "<td><a>Foo</a></td>" +
                        "<td>1 sec</td>" +
                        "<td>1024 MB</td>" +
                        "</tr>" +
                        "</tbody></table>",
                        statusCode: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
            }
            const session = new Session()
            const atcoder = new AtCoder(session, { rawClient: mockClient, url: { atcoder: "http://tmp" } })
            const contest = atcoder.contest("c1")
            const tasks = await contest.tasks()
            tasks.should.deep.equal([{
                id: "foo",
                memoryLimit: { unit: "MB", value: 1024 },
                name: "A - Foo",
                timeLimit: { unit: "sec", value: 1 },
            }])

            history.should.deep.equal([
                ["http://tmp/contests/c1/tasks?lang=en", { session }],
            ])
        })
    })
    describe("#mySubmissions", () => {
        it("get the list of the my submissions", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<table><tbody>" +
                        "<tr><td>2019-01-01 00:00:00</td>" +
                        "<td><a href='contests/c1/tasks/foo'></a></td>" +
                        "<td>User</td><td>Lang</td><td>0</td><td>100 Byte</td><td>AC</td>" +
                        "<td>1 ms</td><td>1 KB</td>" +
                        "<td><a href='contests/c1/submissions/0'></a></td>" +
                        "</tr>" +
                        "</tbody></table>" +
                        "<ul class=pagination><li class=active><a>1</a></li><li><a>2</a></li></ul>",
                        statusCode: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
            }
            const session = new Session()
            const atcoder = new AtCoder(session, { rawClient: mockClient, url: { atcoder: "http://tmp" } })
            const contest = atcoder.contest("c1")
            const submissions = await contest.mySubmissions()
            submissions.should.deep.equal({
                numberOfPages: 2,
                submissions: [
                    {
                        codeSize: { value: 100, unit: "Byte" }, execTime: { value: 1, unit: "ms" }, id: "0",
                        language: "Lang", memory: { value: 1, unit: "KB" },
                        status: "AC", submissionTime: new Date("2019-01-01 00:00:00"), task: "foo", user: "User",
                    },
                ]})

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/me?f.Task=&f.Language=&f.Status=&f.User=&page=1&lang=en",
                 { session }],
            ])

        })

        it("parse HTML when the status is CE", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<table><tbody>" +
                        "<tr><td>2019-01-01 00:00:00</td>" +
                        "<td><a href='contests/c1/tasks/foo'></a></td>" +
                        "<td>User</td><td>Lang</td><td>0</td><td>100 Byte</td><td colspan=3>CE</td>" +
                        "<td><a href='contests/c1/submissions/0'></a></td>" +
                        "</tr>" +
                        "</tbody></table>" +
                        "<ul class=pagination><li class=active><a>1</a></li></ul>",
                        statusCode: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
            }
            const session = new Session()
            const atcoder = new AtCoder(session, { rawClient: mockClient, url: { atcoder: "http://tmp" } })
            const contest = atcoder.contest("c1")
            const submissions = await contest.mySubmissions()
            submissions.should.deep.equal({
                numberOfPages: 1,
                submissions: [
                    {
                        codeSize: { value: 100, unit: "Byte" }, id: "0",
                        language: "Lang",
                        status: "CE", submissionTime: new Date("2019-01-01 00:00:00"), task: "foo", user: "User",
                    },
                ]})

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/me?f.Task=&f.Language=&f.Status=&f.User=&page=1&lang=en",
                 { session }],
            ])

        })

        it("query the submissions", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<table><tbody>" +
                        "</tbody></table>" +
                        "<ul class=pagination><li class=active><a>1</a></li></ul>",
                        statusCode: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
            }
            const session = new Session()
            const atcoder = new AtCoder(session, { rawClient: mockClient, url: { atcoder: "http://tmp" } })
            const contest = atcoder.contest("c1")
            const submissions = await contest.mySubmissions(
                { task: "c1_a", language: "L", status: Status.AC, user: "User"})
            submissions.should.deep.equal({ numberOfPages: 1, submissions: [] })

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/me?" +
                    "f.Task=c1_a&f.Language=L&f.Status=AC&f.User=User&page=1&lang=en",
                 { session }],
            ])

        })
    })
    describe("#submissions", () => {
        it("get the list of the submissions", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<table><tbody></tbody></table>" +
                        "<ul class=pagination><li class=active><a>1</a></li></ul>",
                        statusCode: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
            }
            const session = new Session()
            const atcoder = new AtCoder(session, { rawClient: mockClient, url: { atcoder: "http://tmp" } })
            const contest = atcoder.contest("c1")
            const submissions = await contest.submissions()
            submissions.should.deep.equal({ numberOfPages: 1, submissions: [] })

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions?f.Task=&f.Language=&f.Status=&f.User=&page=1&lang=en",
                 { session }],
            ])

        })

        it("query the submissions", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({
                        body: "<table><tbody>" +
                        "</tbody></table>" +
                        "<ul class=pagination><li class=active><a>1</a></li></ul>",
                        statusCode: 200,
                    })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
            }
            const session = new Session()
            const atcoder = new AtCoder(session, { rawClient: mockClient, url: { atcoder: "http://tmp" } })
            const contest = atcoder.contest("c1")
            const submissions = await contest.submissions(
                { task: "c1_a", language: "L", status: Status.AC, user: "User"})
            submissions.should.deep.equal({ numberOfPages: 1, submissions: [] })

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions?f.Task=c1_a&f.Language=L&f.Status=AC&f.User=User&page=1&lang=en",
                 { session }],
            ])

        })
    })
})

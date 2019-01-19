import * as chai from "chai"
chai.should()

import { IOptions } from "../src/client"
import { Contest } from "../src/contest"
import { Session } from "../src/session"
import { Status } from "../src/submission"

describe("Contest", () => {
    describe("#name", () => {
        it("return the contest name", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ body: "<a class='contest-title'>Title</a>" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ body: "" })
                },
            }
            const session = new Session()
            const contest = new Contest("c1", session, mockClient, "http://tmp")
            const name = await contest.name()
            name.should.equal("Title")

            history.should.deep.equal([
                ["http://tmp/contests/c1/tasks?lang=en", { session }],
            ])
        })
    })
    describe("#problems", () => {
        it("get the list of the problems", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ body: "<table><tbody>" +
                        "<tr><td class='text-center'><a href='contests/c1/tasks/foo'></a></td></tr>" +
                        "<tr><td class='text-center'><a href='contests/c1/tasks/bar'></a></td></tr>" +
                        "</tbody></table"})
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ body: "" })
                },
            }
            const session = new Session()
            const contest = new Contest("c1", session, mockClient, "http://tmp")
            const problems = await contest.problems()
            problems.should.deep.equal(["foo", "bar"])

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
                    return Promise.resolve({ body: "<table><tbody>" +
                        "<tr><td>2019-01-01 00:00:00</td>" +
                        "<td><a href='contests/c1/tasks/foo'></a></td>" +
                        "<td>User</td><td>Lang</td><td>0</td><td>100 Byte</td><td>AC</td>" +
                        "<td>1 ms</td><td>1 KB</td>" +
                        "<td><a href='contests/c1/submissions/0'></a></td>" +
                        "</tr>" +
                        "</tbody></table>"})
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ body: "" })
                },
            }
            const session = new Session()
            const contest = new Contest("c1", session, mockClient, "http://tmp")
            const submissions = await contest.mySubmissions()
            submissions.should.deep.equal([
                {
                    codeSize: { value: 100, unit: "Byte" }, execTime: { value: 1, unit: "ms" }, id: "0",
                    language: "Lang", memory: { value: 1, unit: "KB" },
                    status: "AC", submissionTime: new Date("2019-01-01 00:00:00"), task: "foo", user: "User",
                },
            ])

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/me?f.Task=&f.Language=&f.Status=&f.User=&lang=en", { session }],
            ])

        })

        it("parse HTML when the status is CE", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ body: "<table><tbody>" +
                        "<tr><td>2019-01-01 00:00:00</td>" +
                        "<td><a href='contests/c1/tasks/foo'></a></td>" +
                        "<td>User</td><td>Lang</td><td>0</td><td>100 Byte</td><td colspan=3>CE</td>" +
                        "<td><a href='contests/c1/submissions/0'></a></td>" +
                        "</tr>" +
                        "</tbody></table>"})
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ body: "" })
                },
            }
            const session = new Session()
            const contest = new Contest("c1", session, mockClient, "http://tmp")
            const submissions = await contest.mySubmissions()
            submissions.should.deep.equal([
                {
                    codeSize: { value: 100, unit: "Byte" }, id: "0",
                    language: "Lang",
                    status: "CE", submissionTime: new Date("2019-01-01 00:00:00"), task: "foo", user: "User",
                },
            ])

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/me?f.Task=&f.Language=&f.Status=&f.User=&lang=en", { session }],
            ])

        })

        it("query the submissions", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ body: "<table><tbody>" +
                        "</tbody></table>"})
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ body: "" })
                },
            }
            const session = new Session()
            const contest = new Contest("c1", session, mockClient, "http://tmp")
            const submissions = await contest.mySubmissions(
                { task: "c1_a", language: "L", status: Status.AC, user: "User"})
            submissions.should.deep.equal([])

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions/me?f.Task=c1_a&f.Language=L&f.Status=AC&f.User=User&lang=en",
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
                    return Promise.resolve({ body: "<table><tbody>" +
                        "<tr><td>2019-01-01 00:00:00</td>" +
                        "<td><a href='contests/c1/tasks/foo'></a></td>" +
                        "<td>User</td><td>Lang</td><td>0</td><td>100 Byte</td><td>AC</td>" +
                        "<td>1 ms</td><td>1 KB</td>" +
                        "<td><a href='contests/c1/submissions/0'></a></td>" +
                        "</tr>" +
                        "</tbody></table>"})
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ body: "" })
                },
            }
            const session = new Session()
            const contest = new Contest("c1", session, mockClient, "http://tmp")
            const submissions = await contest.submissions()
            submissions.should.deep.equal([
                {
                    codeSize: { value: 100, unit: "Byte" }, execTime: { value: 1, unit: "ms" }, id: "0",
                    language: "Lang", memory: { value: 1, unit: "KB" },
                    status: "AC", submissionTime: new Date("2019-01-01 00:00:00"), task: "foo", user: "User",
                },
            ])

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions?f.Task=&f.Language=&f.Status=&f.User=&lang=en", { session }],
            ])

        })

        it("query the submissions", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ body: "<table><tbody>" +
                        "</tbody></table>"})
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ body: "" })
                },
            }
            const session = new Session()
            const contest = new Contest("c1", session, mockClient, "http://tmp")
            const submissions = await contest.submissions(
                { task: "c1_a", language: "L", status: Status.AC, user: "User"})
            submissions.should.deep.equal([])

            history.should.deep.equal([
                ["http://tmp/contests/c1/submissions?f.Task=c1_a&f.Language=L&f.Status=AC&f.User=User&lang=en",
                 { session }],
            ])

        })
    })
})
